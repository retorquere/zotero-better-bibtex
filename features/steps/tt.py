import toml
import munch

with open('preferences.toml') as f:
  preferences = toml.load(f)

def nested_dict_iter(nested, root = []):
  for key, value in nested.items():
    if isinstance(value, dict):
      for inner_key, inner_value in nested_dict_iter(value, root + [key]):
        yield inner_key, inner_value
    else:
      yield '.'.join(root) + '.' + key, value

for p in nested_dict_iter(preferences):
  print(p)
