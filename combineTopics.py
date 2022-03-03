import json
from urllib.request import urlopen

f = open('src/annotations.json')

data = json.load(f)

f1 = open('src/topics.json')

topicsRaw = json.load(f1)

processedAnnotations = {}

for topicId in topicsRaw:
    url = "https://app.lvn.org/api/topic/snippets/?topic_id=" + str(topicId)
    response = urlopen(url)
    topicData = json.loads(response.read())

    topicName = topicsRaw[topicId]['name']
    count = 0
    for snippetId in topicData['data']['entities']['topic_snippets']:
        for i in data['annotations']:
            snippets = data['annotations'][i]['snippet_ids']

            found = 0
            for snippet in snippets:
                if str(snippetId) == str(snippet):
                    found = 1
            if found == 1:
                print(i)
                if not 'topic' in data['annotations'][i]:
                    data['annotations'][i]['topic'] = {}
                data['annotations'][i]['topic'][topicName] = topicsRaw[topicId]['display_name']
                for terms in topicData['data']['entities']['topic_snippets'][snippetId]['matched_terms']:
                    if not 'subTopics' in data['annotations'][i]:
                        data['annotations'][i]['subTopics'] = {}
                    if not topicName in data['annotations'][i]['subTopics']:
                        data['annotations'][i]['subTopics'][topicName] = []
                    data['annotations'][i]['subTopics'][topicName].append(terms['term'])

    print("Completed topic " + str(topicId) + " with " + str(count) + " added snippets")

with open('annotationsTopicsCombined.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)       

f1.close() 
f.close()