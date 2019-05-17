import datetime
import json

def get_chars():
  with open("char_info.json") as char_info_json:
    data = json.load(char_info_json)
    return data["characters"]

def get_episodes():
  with open("episodes.json") as json_file:
    data = json.load(json_file)
    return data["episodes"]

chars = get_chars()
all_episodes = get_episodes()

def main():
  result = []
  for num in range(1, 9):
    add_to_result = get_characters_from_season(num)
    result.append(add_to_result)

  # with open("char_dict.json", "w") as outfile:
  #   json.dump(characters, outfile)

  # save to file
  with open("characters.json", "w") as outfile:
    json.dump(result, outfile)

def get_characters_from_season(season_num):
  episodes = [x for x in all_episodes if x["seasonNum"] == season_num]

  characters = {} 
  kills = {}
  for episode in episodes:
    for scene in episode["scenes"]:
      for character in scene["characters"]:
        name = character["name"]
        if "killedBy" in character:
          try:
            killed_by = character["killedBy"][0]
          except IndexError as e:
            print(repr(e))
            print(character)
          if killed_by in kills:
            kills[killed_by] += 1
          else:
            kills[killed_by] = 1
        if name in characters:
          start = scene["sceneStart"]
          end = scene["sceneEnd"]
          time_to_add = time_difference(start,end)

          char = characters[name]
          char["numOfScenes"] += 1
          char["screenTime"] = time_sum(char["screenTime"], time_to_add)
        else:
          char_info = get_char_info(name)
          if not char_info:
            continue
          house_name = char_info["houseName"] if "houseName" in char_info else None
          start = scene["sceneStart"]
          end = scene["sceneEnd"]
          characters[name] = {
            "house": house_name,
            "season": episode["seasonNum"],
            "numOfScenes": 1,
            "numOfKills": 0,
            "screenTime": time_difference(start, end)
          }
  for name in kills:
    try: 
      characters[name]["numOfKills"] = kills[name]
    except KeyError as e:
      print(repr(e))

  result = []

  for name, stats in characters.items():
    stats["character"] = name
    result.append(stats)

  # result.sort(key = lambda i: i["numOfScenes"], reverse = True)

  return result


def time_sum(time1, time2):
  a = str_to_timedelta(time1)
  b = str_to_timedelta(time2)
  return str(a + b)

def time_difference(start, end):
  start_delta = str_to_timedelta(start)
  end_delta = str_to_timedelta(end)
  return str(end_delta - start_delta)


def str_to_timedelta(string):
  (h, m ,s) = string.split(':')
  d = datetime.timedelta(hours = int(h), minutes=int(m), seconds=int(s))
  return d

def get_char_info(char_name):
  for char in chars:
    if char["characterName"] == char_name:
      return char


main()