import os
import random
import json

version_len = 61
path = 'public/audios/'
folders = os.listdir(path)
all_files = []
for i in folders:
        if i!= '.DS_Store':
                files = os.listdir(path+i+'/charismatic/')
                files = [i+'/charismatic/'+j for j in files if j!= '.DS_Store']
                all_files.extend(files)


seen_files = dict()
json_dict = dict()

indices = set(range(len(all_files)))

for key_json in range(int(len(all_files)/version_len)+1):
        if version_len < len(indices):
                random_files = random.sample(indices, version_len)
        else:
                random_files = indices
        print(len(random_files))
        json_dict[key_json] = [all_files[i] for i in random_files]
        indices = indices.difference(set(random_files))



                
with open("version_file_list.json", "w") as outfile:
    json.dump(json_dict, outfile)

