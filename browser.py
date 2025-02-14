import os
import random
import threading
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Global variables to manage driver & typing thread state
driver = None
typing_thread = None
pause_flag = False
stop_flag = False

def generate_typo(word):
    if len(word) <= 1:
        return word
    operations = [
        lambda w: w[0] + w[2] + w[1] + w[3:] if len(w) > 2 else w,
        lambda w: w + w[-1],
        lambda w: w[:-1],
        lambda w: w[0] + w[0] + w[1:] if len(w) > 0 else w
    ]
    return random.choice(operations)(word)

def calculate_typing_delay(wpm):
    base_delay = 60.0 / (wpm * 5)
    return base_delay

def open_google_docs():
    global driver
    options = uc.ChromeOptions()
    if os.name == 'posix':
        options.binary_location = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    driver = uc.Chrome(
        user_data_dir="./chromeData",
        options=options
    )
    driver.get("https://docs.google.com/document/u/0/")
    wait = WebDriverWait(driver, 20)
    wait.until(lambda d: '/document/d/' in d.current_url)

def type_text(text, wpm=45, error_rate=0.2):
    global driver, pause_flag, stop_flag
    if driver is None:
        print("Driver not started")
        return

    # Find the editable element using a contenteditable selector instead of canvas
    try:
        editable_area = driver.find_element(By.TAG_NAME, "canvas")
        # Focus the element explicitly
        driver.execute_script("arguments[0].focus();", editable_area)
        ActionChains(driver).move_to_element(editable_area).click().perform()
    except Exception as e:
        print("Editable element not found or not interactable:", e)
        return

    base_delay = calculate_typing_delay(wpm)
    actions = ActionChains(driver)

    for line in text.split('\n'):
        if stop_flag:
            break
        for word in line.split():
            while pause_flag and not stop_flag:
                time.sleep(0.5)
            if stop_flag:
                break

            if random.random() < error_rate:
                typo = generate_typo(word)
                for char in typo:
                    actions.send_keys(char).perform()
                    time.sleep(base_delay * random.uniform(0.8, 1.2))
                time.sleep(base_delay * 2)
                for _ in range(len(typo)):
                    actions.send_keys(Keys.BACKSPACE).perform()
                    time.sleep(base_delay * 0.5)
                for char in word:
                    actions.send_keys(char).perform()
                    time.sleep(base_delay * random.uniform(0.8, 1.2))
            else:
                for char in word:
                    actions.send_keys(char).perform()
                    time.sleep(base_delay * random.uniform(0.8, 1.2))
            actions.send_keys(Keys.SPACE).perform()
            time.sleep(base_delay * 2)
        actions.send_keys(Keys.ENTER).perform()
        time.sleep(base_delay * 3)

def start_typing(text, wpm=45, error_rate=0.2):
    global typing_thread, stop_flag, pause_flag
    # Reset control flags
    stop_flag = False
    pause_flag = False
    typing_thread = threading.Thread(target=type_text, args=(text, wpm, error_rate))
    typing_thread.start()

def pause_typing():
    global pause_flag
    pause_flag = True

def resume_typing():
    global pause_flag
    pause_flag = False

def close_browser():
    global driver, stop_flag, typing_thread, pause_flag
    stop_flag = True
    pause_flag = False
    if typing_thread and typing_thread.is_alive():
        typing_thread.join(timeout=5)
    if driver:
        try:
            driver.close()
        except Exception as e:
            print("Error closing driver:", e)
        driver = None

if __name__ == "__main__":
    with open("test.txt", "r") as file:
        text = file.read()
    text = text.replace("\n- ", "\n-")
    open_google_docs()
    start_typing(text, wpm=100, error_rate=0.2)