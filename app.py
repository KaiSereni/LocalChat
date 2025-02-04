from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
import json

IS_TEST = True

if not IS_TEST:
    from transformers import pipeline

app = Flask(__name__, 
    static_folder='public', # For Next.js public assets
    template_folder='templates' # For Next.js static HTML
)

# Enable CORS
CORS(app)

# Add static file handling
@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('templates', path)

# Update index route to serve Next.js index.html
@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

generator = None
model_name = None

@app.route('/chat', methods=['POST'])
def chat():
    global generator, model_name
    data: dict = request.get_json() 
    messages = data['messages']
    requested_model = data.get('model', 'gpt2')
    temperature = float(data.get('temperature', 0.9))
    max_length = int(data.get('max_length', 100))
    chatid = data.get('chatid', '0')

    # Early return for test mode
    if IS_TEST:
        DEFAULT_RETURN = 'This is a test'
        with open('chatHistory.json', 'r') as f:
            chatHistory: dict = json.load(f)
        if chatid not in chatHistory:
            chatHistory[chatid] = {'title': 'Test Chat', 'messages': []}
        chatHistory[chatid]['messages'].append({'role': 'user', 'content': messages[-1]['content']})
        chatHistory[chatid]['messages'].append({'role': 'assistant', 'content': DEFAULT_RETURN})
        with open('chatHistory.json', 'w') as f:
            json.dump(chatHistory, f, indent=4)
        return jsonify({'response': DEFAULT_RETURN})

    # Check if model needs to be loaded/changed
    if not generator or model_name != requested_model:
        try:
            model_name = requested_model
            generator = pipeline('text-generation', model=model_name)
        except Exception as e:
            return jsonify({'error': f'Failed to load model {requested_model}: {str(e)}'}), 500

    # Return empty response if most recent message is empty
    if messages[-1]['content'].strip() == '':
        return jsonify({'message': 'Error: empty message!'})

    # Create conversation history
    prompt = ""
    for msg in messages:
        if msg['role'] == 'user':
            prompt += f"User: {msg['content']}\n"
        else:
            prompt += f"Bot: {msg['content']}\n"
    prompt += "Bot: "

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
    
    # Save updated chat history
    with open('chatHistory.json', 'r') as f:
        chatHistory: dict = json.load(f)
    chatHistory[chatid]['messages'].append({'role': 'bot', 'content': response})
    with open('chatHistory.json', 'w') as f:
        json.dump(chatHistory, f, indent=4)

    return jsonify({'message': response})

@app.route('/chatList', methods=['GET'])
def chatHistory():
    with open('chatHistory.json', 'r') as f:
        chatHistory: dict = json.load(f)
    chatids = chatHistory.keys()
    id_title_list = []
    for chatid in chatids:
        id_title_list.append({'id': str(chatid), 'title': chatHistory[chatid]['title']})
    return jsonify(id_title_list)

@app.route('/chatHistory', methods=['POST'])
def chatHistoryPost():
    data: dict = request.get_json()
    chatid = data['chatid']
    with open('chatHistory.json', 'r') as f:
        chatHistory: dict = json.load(f)
    try:
        return jsonify(chatHistory[chatid])
    except:
        return jsonify([])
    
@app.route('/deleteChat', methods=['POST'])
def deleteChat():
    data: dict = request.get_json()
    chatid = data['chatid']
    with open('chatHistory.json', 'r') as f:
        chatHistory: dict = json.load(f)
    chatHistory.pop(chatid)
    with open('chatHistory.json', 'w') as f:
        json.dump(chatHistory, f, indent=4)
    return jsonify({'message': 'Chat deleted successfully'})

# Add this new route to handle model loading
@app.route('/loadModel', methods=['POST'])
def load_model():
    try:
        data = request.json
        global model_name
        model_name = data['model']
        
        # Clear any existing model from memory
        global generator
        generator = None
        
        # Load the new model
        if not IS_TEST:
            generator = pipeline('text-generation', model=model_name)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)