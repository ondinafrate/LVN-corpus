import json

f = open('src/annotations.json')

data = json.load(f)

f1 = open('src/topics.json')

topicsRaw = json.load(f1)

processedAnnotations = {}

for i in data['annotations']:
    convId = data['annotations'][i]['conversation_id']
    topics = {}
    subTopics = {}
    print("Processing " + str(convId))
    for topicId in topicsRaw:
        topicName = topicsRaw[topicId]['name']
        terms = []
        for keyword in topicsRaw[topicId]['keywords']:
            if convId in keyword['conversations_matched']:
                terms.append(keyword['term'])
        if len(terms) > 0:
            topics[topicName] = topicsRaw[topicId]['display_name']
            subTopics[topicName] = terms
    print("Complete")
    data['annotations'][i]['topics'] = topics
    data['annotations'][i]['subTopics'] = subTopics
    processedAnnotations[convId] = data['annotations'][i]
print(len(processedAnnotations.keys()))
with open('annotationsCombined.json', 'w', encoding='utf-8') as f:
        json.dump(processedAnnotations, f, ensure_ascii=False, indent=4)

f1.close() 
f.close()