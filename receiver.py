import socket
from encryption_utils import decrypt_file
from utils import compute_hash
from blockchain_utils import get_file_hash

s = socket.socket()
s.bind(("localhost", 9999))
s.listen(1)
conn, addr = s.accept()

received = conn.recv(10000000)
key, data = received.split(b'||', 1)

decrypted = decrypt_file(data, key)
with open("received_file.txt", "wb") as f:
    f.write(decrypted)

received_path = "received_file.txt"
local_hash = compute_hash(received_path)
chain_hash = get_file_hash("file.txt")

if local_hash == chain_hash:
    print("✅ File integrity verified.")
else:
    print("❌ File has been tampered with.")


conn.close()
s.close()
