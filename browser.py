import undetected_chromedriver as uc
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time  # Added import for time

driver = uc.Chrome(user_data_dir="./chromeData")
driver.get("https://docs.google.com/document/u/0/")  # Updated URL for Google Docs
time.sleep(5)
# Locate the editable area
editable_area = driver.find_element(By.TAG_NAME, "canvas")  # New code to find editable area

# Ensure the area is focused
ActionChains(driver).move_to_element(editable_area).click().perform()  # New code to focus on editable area

# Simulate typing text
actions = ActionChains(driver)  # New code to create ActionChains
actions.send_keys("CANNON = SPEED").perform()  # New code to type text
actions.send_keys(Keys.RETURN).send_keys("AAAA KAI = INSIDE CANNON").perform()  # New code to add a new line

time.sleep(15)  # Wait to observe the result
driver.close()  # Changed from driver.quit() to driver.close() to match original code