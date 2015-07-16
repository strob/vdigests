# Takes a video and a word-aligned transcript, and adds it into mongo
from pymongo import MongoClient
import os
import uuid
import json
import sys
import time

VIDEO_PATH = sys.argv[1]
JSON_PATH  = sys.argv[2]
VIDEO_NAME = sys.argv[3]

# Assumes video was downloaded with `youtube dl -t`
YT_ID = VIDEO_PATH[-14:-4]

# NB: This *must* be seven characters.
digest_id = YT_ID[:7]

# Create a symlink to the video in `ffdata'
# NB: Don't move the video!
ff_vpath = '../ffdata/videos/%s.mp4' % (YT_ID)
print ff_vpath
if not os.path.exists(ff_vpath):
    os.symlink(os.path.abspath(VIDEO_PATH), ff_vpath)

client = MongoClient("mongodb://localhost:27017")
db = client.vdigest
vdigests = db.vdigests

transcript = json.load(open(JSON_PATH))
transcript_words = " ".join([X["word"] for X in transcript["words"]])

doc = {
    "_id": digest_id,
    "audioName": YT_ID,
    "digest": {"chapters": [], "title": VIDEO_NAME},
    "preAlignTrans": [{"_id": uuid.uuid4().get_hex(),
                       "line": transcript_words,
                       "speaker": 0}],

    "alignTrans": {"words": [
        {"start": X["start"],
         "speaker": 0,
         "end": X["start"] + X["duration"],
         "word": X["word"],
         "sentenceNumber": 0,
         "alignedWord": X["word"]
     } for X in transcript["words"]]},
    "pubdisplay": True,         # Will this put it on the homepage?
    "rawTransName": os.path.basename(JSON_PATH), # What does this do?
    "state": 1,                                  # Done!
    "uploadDate": time.time(),
    # For now, just use the end of the last word as the video duration
    "videoLength": transcript["words"][-1]["start"] + transcript["words"][-1]["duration"],
    "videoName": YT_ID,          # Why is this the YT_ID?
    # XXX: Should better-sanitize name
    "puburl": "/view/%s-%s" % (VIDEO_NAME.replace(' ', '-'), digest_id),
    "YT_ID": YT_ID,
    "anyedit": True,
    }

print doc

vdigests.save(doc)
