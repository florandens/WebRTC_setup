
import socket
import time
from stun_protocol.message import Message, MessageClass, MessageMethod

# Create a STUN Binding Request message
message = Message(MessageClass.REQUEST, MessageMethod.BINDING)

# Pack the message into a buffer
buffer = message.pack()

# Send the message over a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
stun_server_address = ('192.168.1.80', 3478)            #CoTURN server information

i = 0
while(True):
    i += 1
    sock.sendto(buffer, stun_server_address)
    time.sleep(0.05)
    print("i send already " + str(i) + " packets")

