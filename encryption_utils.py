from cryptography.fernet import Fernet

def generate_key():
    return Fernet.generate_key()

def encrypt_file(data, key):
    f = Fernet(key)
    return f.encrypt(data)

def decrypt_file(data, key):
    f = Fernet(key)
    return f.decrypt(data)
