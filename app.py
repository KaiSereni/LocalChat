from flask import Flask, request, jsonify, render_template, send_from_directory
from transformers import pipeline
import threading
import os

app = Flask(__name__, 
    static_folder='public', # For Next.js public assets
    template_folder='templates' # For Next.js static HTML
)

# Cache for loaded models
model_cache = {}
model_lock = threading.Lock()

# Add static file handling
@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('templates', path)

# Update index route to serve Next.js index.html
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data['messages']
    model_name = data.get('model', 'gpt2')
    temperature = float(data.get('temperature', 0.9))
    max_length = int(data.get('max_length', 100))

    # Create conversation history
    prompt = ""
    for msg in messages:
        if msg['role'] == 'user':
            prompt += f"User: {msg['content']}\n"
        else:
            prompt += f"Bot: {msg['content']}\n"
    prompt += "Bot: "

    # Get or load the model
    with model_lock:
        if (model_name not in model_cache):
            try:
                model_cache[model_name] = pipeline(
                    'text-generation', 
                    model=model_name
                )
            except Exception as e:
                return jsonify({'error': str(e)}), 400

        generator = model_cache[model_name]

    # Generate response
    try:
        response = generator(
            prompt,
            max_length=max_length,
            temperature=temperature,
            num_return_sequences=1,
            return_full_text=False
        )[0]['generated_text'].strip()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)