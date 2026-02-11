import streamlit as st
import google.generativeai as genai

# --- CONFIGURACIÓN ---
# Pega aquí tu API Key de Google AI Studio
API_KEY = "AIzaSyBUTy7W9d8VGfZ7tjI5icVw9pmUqjZa0WI" 

# Estas son las instrucciones extraídas de tu imagen de Byte-SoportePC
INSTRUCCIONES_DEL_SISTEMA = """
Eres BYTE AI, el asistente virtual experto en tecnología de 'BYTE COMPUTADORAS'.
Tu objetivo es brindar soporte técnico inteligente disponible 24/7.
Debes ayudar a los usuarios con:
1. Diagnóstico de problemas de hardware y software.
2. Soluciones para PC lenta o con bajo rendimiento.
3. Problemas de conexión a Internet y redes.
4. Consejos de seguridad informática (como el uso de bloqueadores de datos USB).

Tu tono es profesional, tecnológico, eficiente y amable. 
Si no puedes resolver algo, recomienda al usuario visitar la tienda física de Byte Computadoras.
"""

genai.configure(api_key=API_KEY)

# Configuración del modelo
model = genai.GenerativeModel(
    model_name='gemini-1.5-flash',
    system_instruction=INSTRUCCIONES_DEL_SISTEMA
)

# --- INTERFAZ ESTILO BYTE AI ---
st.set_page_config(page_title="BYTE AI - Soporte Técnico", page_icon="🤖")

st.markdown("<h1 style='text-align: center; color: #00ff88;'>BYTE COMPUTADORAS</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center;'>SMART SUPPORT AI</p>", unsafe_allow_html=True)

# Botones de acciones rápidas (como en tu imagen)
st.write("### Acciones Rápidas")
col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🔍 Diagnóstico"):
        st.session_state.messages.append({"role": "user", "content": "Necesito un diagnóstico de mi equipo."})
with col2:
    if st.button("⚡ PC Lenta"):
        st.session_state.messages.append({"role": "user", "content": "Mi computadora está muy lenta, ¿qué puedo hacer?"})
with col3:
    if st.button("🌐 Internet"):
        st.session_state.messages.append({"role": "user", "content": "Tengo problemas con mi conexión a internet."})

# Historial de chat
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Entrada de usuario
if prompt := st.chat_input("Describe tu problema aquí..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    try:
        response = model.generate_content(prompt)
        with st.chat_message("assistant"):
            st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
    except Exception as e:
        st.error(f"Error de conexión: {e}")
