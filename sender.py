import socket
from encryption_utils import generate_key, encrypt_file
from utils import compute_hash
from blockchain_utils import store_file_hash

key = generate_key()

file_path = "file.txt"
file_hash = compute_hash(file_path)
store_file_hash("file.txt", file_hash)

with open("file.txt", "rb") as f:
    file_data = f.read()

encrypted_data = encrypt_file(file_data, key)

s = socket.socket()
s.connect(("localhost", 9999))
s.sendall(key + b"||" + encrypted_data)
s.close()

