from transformers import AutoModelForCausalLM, BitsAndBytesConfig, AutoTokenizer
import torch
import os
import gc
from typing import Optional
import psutil

class GPT:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = None
        self.cache_dir = "./model_cache"
        self.current_device = "cpu"
        os.makedirs(self.cache_dir, exist_ok=True)

    def load_model(self, model_name="gpt2", temperature=0.7, quantize_bits=8, device="auto"):
        """Load a GPT model with memory optimization options."""
        try:
            # Determine device placement
            if device == "auto":
                self.current_device = "cuda" if torch.cuda.is_available() else "cpu"
            else:
                self.current_device = device

            # Configure quantization
            model_kwargs = {
                "device_map": self.current_device,
                "torch_dtype": torch.float16 if quantize_bits == 16 else torch.int8,
                "load_in_8bit": quantize_bits == 8,
            }

            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                **model_kwargs
            )
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model_name = model_name
            self.temperature = temperature
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

    def offload_layer(self, layer_name: str) -> bool:
        """Offload a specific layer to disk."""
        try:
            if self.model is None:
                return False
            
            layer_path = os.path.join(self.cache_dir, f"{layer_name}.pt")
            torch.save(self.model.state_dict()[layer_name], layer_path)
            del self.model.state_dict()[layer_name]
            torch.cuda.empty_cache()
            gc.collect()
            return True
        except Exception as e:
            print(f"Error offloading layer: {e}")
            return False

    def load_layer(self, layer_name: str) -> bool:
        """Load a specific layer from disk."""
        try:
            layer_path = os.path.join(self.cache_dir, f"{layer_name}.pt")
            if not os.path.exists(layer_path):
                return False
            
            weights = torch.load(layer_path)
            self.model.state_dict()[layer_name] = weights
            return True
        except Exception as e:
            print(f"Error loading layer: {e}")
            return False

    def generate_completion(self, prompt, max_length=100):
        """Generate a completion with memory optimization."""
        if not self.model or not self.tokenizer:
            raise RuntimeError("No model is currently loaded")

        try:
            # Monitor memory usage
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

            # Encode with memory check
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.current_device)
            
            # Generate with minimal memory footprint
            with torch.cuda.amp.autocast(enabled=self.current_device=="cuda"):
                outputs = self.model.generate(
                    inputs["input_ids"],
                    max_length=max_length,
                    temperature=self.temperature,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    num_beams=1
                )
            
            completion = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return completion
        except Exception as e:
            print(f"Error generating completion: {e}")
            return None

    def get_memory_usage(self):
        """Get current memory usage statistics."""
        memory_stats = {
            "ram_used": psutil.Process().memory_info().rss / 1024**2,  # MB
            "cuda_used": torch.cuda.memory_allocated() / 1024**2 if torch.cuda.is_available() else 0
        }
        return memory_stats

    def unload_model(self):
        """Unload model and clean up cache."""
        if self.model:
            del self.model
            del self.tokenizer
            self.model = None
            self.tokenizer = None
            self.model_name = None
            torch.cuda.empty_cache()
            gc.collect()
            return True
        return False