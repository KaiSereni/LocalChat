import os
import random
import undetected_chromedriver as uc
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def generate_typo(word):
    if len(word) <= 1:
        return word
    
    # Common typing mistakes
    operations = [
        lambda w: w[0] + w[2] + w[1] + w[3:] if len(w) > 2 else w,  # swap adjacent letters
        lambda w: w + w[-1],  # duplicate last letter
        lambda w: w[:-1],     # miss last letter
        lambda w: w[0] + w[0] + w[1:] if len(w) > 0 else w  # duplicate first letter
    ]
    return random.choice(operations)(word)

def calculate_typing_delay(wpm):
    base_delay = 60.0 / (wpm * 5)  # Average delay per character (assuming 5 chars per word)
    return base_delay

def type_text(text, wpm=45, error_rate=0.2):
    try:
        # Set Chrome binary location based on OS
        if os.name == 'posix':  # macOS and Linux
            chrome_path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        else:  # Windows
            chrome_path = 'C:/Program Files/Google Chrome/chrome.exe'

        options = uc.ChromeOptions()
        options.binary_location = chrome_path
        
        driver = uc.Chrome(
            user_data_dir="./chromeData",
            options=options
        )
        
        driver.get("https://docs.google.com/document/u/0/")
        wait = WebDriverWait(driver, 20)
        wait.until(EC.url_contains('/document/d/'))

        actions = ActionChains(driver)
        base_delay = calculate_typing_delay(wpm)
        
        for line in text.split('\n'):
            for word in line.split():
                if random.random() < error_rate:
                    # Type word with typo
                    typo = generate_typo(word)
                    for char in typo:
                        actions.send_keys(char)
                        actions.pause(base_delay * random.uniform(0.8, 1.2))
                    
                    # Pause before correction
                    actions.pause(base_delay * 2)
                    
                    # Delete the typo
                    for _ in range(len(typo)):
                        actions.send_keys(Keys.BACKSPACE)
                        actions.pause(base_delay * 0.5)
                    
                    # Type correct word
                    for char in word:
                        actions.send_keys(char)
                        actions.pause(base_delay * random.uniform(0.8, 1.2))
                else:
                    # Type word normally
                    for char in word:
                        actions.send_keys(char)
                        actions.pause(base_delay * random.uniform(0.8, 1.2))
                
                actions.send_keys(Keys.SPACE)
                actions.pause(base_delay * 2)  # Longer pause between words
            
            actions.send_keys(Keys.ENTER)
            actions.pause(base_delay * 3)  # Extra pause at line breaks
        
        actions.perform()
    
        time.sleep(2)  # Wait to observe result
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    finally:
        if 'driver' in locals():
            driver.close()

if __name__ == "__main__":
    text = "Hello, this is a test message.\nThis is a second line."
    type_text(text)