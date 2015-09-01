require 'ostruct'
require 'shellwords'

class AMOSigner
  @@ManageTitle = 'Manage Version'

  def initialize(addon, login, password)
    @addon = addon
    @url = OpenStruct.new({
      login:  "https://addons.mozilla.org/en-US/firefox/users/login?to=%2Fen-US%2Ffirefox%2F",
      upload: "https://addons.mozilla.org/en-US/developers/addon/#{@addon}/versions#version-upload",
      addon:  "https://addons.mozilla.org/en-US/developers/addon/#{@addon}versions"
    })
    @login = login
    @password = password
    throw 'No passord' unless @password
  end

  def login
    puts "Logging in into #{@url.login}"
    @driver.get(@url.login)
    puts '...'

    elem = @wait.until {
      element = @driver.find_element(:name, 'username')
      element if element.displayed?
    }
    elem.send_keys(@login)

    elem = @wait.until {
      element = @driver.find_element(:name, 'password')
      element if element.displayed?
    }
    elem.send_keys(@password)
    elem.send_keys(:enter)

    elem = @wait.until { @driver.title == 'Add-ons for Firefox' }
  end

  def upload(path)
    puts "Uploading at #{@url.upload}"
    @driver.get(@url.upload)
    puts '...'

    elem = @wait.until {
      element = @driver.find_element(:class, 'upload-file')
      element if element.displayed?
    }
    puts '...'
    puts 'style = ' + @driver.execute_script("""
      var element = document.getElementById('upload-addon');

      element.removeAttribute('class');
      element.removeAttribute('style');

      element.style.opacity = 1;
      element.style.position = 'relative';
      element.style.width = '20em';
      element.onmoseover = function() {};

      var cs = window.getComputedStyle(element,null);
      var len = cs.length;
      var style = {};
      for (var i=0;i<len;i++) {
        var prop = cs[i];
        style[prop] = cs.getPropertyValue(prop);
      }
      // return JSON.stringify(style, null, 2);
      return '';
      """)
    elem = @driver.find_element(:id, 'upload-addon')
    elem.send_keys(path)
    @driver.execute_script("document.getElementById('upload-addon').blur();")

    puts "Uploading #{path} ..."
    elem = @wait.until {
      element = @driver.find_element(:id, 'upload-file-finish')
      #element if element.enabled?
    }

    puts 'Adding version ...'
    elem.click
  end

  def find_last_version
    puts "Trying #{@url.addon} manually..."
    @driver.get(@url.addon)
    elem = @wait.until {
      element = @driver.find_element(:css, '#current-version-status a')
      element if element.displayed?
    }
    puts '...'
    elem.click
    elem = @wait.until { @driver.title[0..@@ManageTitle.length] == @@ManageTitle }
  end

  def download(path)
    begin
      elem = @wait.until { @driver.title[0..@@ManageTitle.length] == @@ManageTitle }
    rescue TimeoutException
      # README: always happens with Xvfb AKA 'headless'
      puts 'Timeout.'
      find_last_version
    end

    puts "Downloading from #{@driver.current_url} ..."
    elem = @wait.until {
      element = @driver.find_element(:css, '#file-list a')
      element if element.displayed?
    }
    url = elem.get_attribute('href')

    puts "Downloading #{url} to #{path} ..."
    cookie = @driver.get_cookie('sessionid')['value']
    sh "curl -L -b sessionid=#{Shellwords.escape(cookie)} -o #{hellwords.escape(path)} #{hellwords.escape(url)}"
    puts 'Success.'
  end

  def sign(infile, outfile)
    @driver = Selenium::WebDriver.for :firefox
    @wait = Selenium::WebDriver::Wait.new(:timeout => 60)
    begin
      login
      upload(infile)
      download(outfile)
    ensure
      @driver.quit
    end
  end
end
