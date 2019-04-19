#!/usr/bin/env python3

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from pushbullet import Pushbullet
import os
import sys

pb = Pushbullet(os.environ['PUSHBULLET_TOKEN'])
push = pb.push_note(' '.join(sys.argv[1:]), sys.stdin.read())
