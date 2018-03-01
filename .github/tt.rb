require 'yaml'


open('config.yml', 'w'){|f| f.puts({
  'label-gun' => {
    'labels' => {
      'ignore' => ['chatter', 'deferred']
    }
  }
}.to_yaml)
}

