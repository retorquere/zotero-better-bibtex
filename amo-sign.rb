require 'ostruct'

class AMOSigner
  @@ManageTitle = 'Manage Version'

  def initialize(addon, login)
    @addon = addon
    @url = OpenStruct.new({
      login: "https://addons.mozilla.org/en-US/firefox/users/login?to=%2Fen-US%2Ffirefox%2F"
      upload: "https://addons.mozilla.org/en-US/developers/addon/#{@addon}/versions#version-upload"
      addon: "https://addons.mozilla.org/en-US/developers/addon/#{@addon}versions"
    }
    @login = login
    @password = password
    @driver = ""
    @wait = Selenium::WebDriver::Wait.new(:timeout => 30)

  def login
    puts "Logging in into #{@url.login}"
    @driver.get(@url.login)
    puts '...'

    elem = @wait.until {
      element = driver.find_element(:name, 'username')
      element if element.displayed?
    }
    elem.send_keys(@login)

    elem = @wait.until {
      element = driver.find_element(:name, 'password')
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
      element = driver.find_element(:class, 'upload-file')
      element if element.displayed?
    }
    puts '...'
    elem = driver.find_element(:id, 'upload-addon')
    elem.send_keys(path)

    puts "Uploading #{path} ..."
    elem = @wait.until {
      element = driver.find_element(:id, 'upload-file-finish')
      element if element.enabled?
    }

    puts 'Adding version ...'
    elem.click
  end

  def find_last_version
    puts "Trying #{@url.addon} manually..."
    @driver.get(@url.addon)
    elem = @wait.until {
      element = driver.find_element(:css, '#current-version-status a')
      element if element.displayed?
    }
    puts '...'
    elem.click
    elem = @wait.until { @driver.title[0..@@ManageTitle.length] == @@ManageTitle }
  end

  def download(path)
    begin
      WebDriverWait(driver, 60).until(lambda x: x.title[:len(MANAGE_TITLE)] == MANAGE_TITLE)
    rescue TimeoutException
      # README: always happens with Xvfb AKA 'headless'
      puts 'Timeout.'
      find_last_version
    end

    puts "Downloading from #{@ver.current_url} ..."
    elem = @wait.until {
      element = driver.find_element(:css, '#file-list a')
      element if element.displayed?
    }
    url = elem.get_attribute('href')

    puts "Downloading #{url} to #{path} ..."
    cookie = driver.get_cookie('sessionid')['value']
    cmd = ['curl', '-L', '-b', 'sessionid=' + cookie, '-o', path, url]
    retcode = subprocess.call(cmd)
    if retcode:
      raise Exception('curl exited with status: %s' % retcode)

    puts 'Success.'
  end

  def run(infile, outfile):
    ff_bin = FirefoxBinary(FF_PATH)
    driver = webdriver.Firefox(firefox_binary=ff_bin)
    try:
        login(driver)
        upload(driver, infile)
        download(driver, outfile)
    except Exception as err:
        puts('Error at %s (%s)' % (driver.title, driver.current_url))
        raise err
    finally:
        driver.quit()
  end
end

if __name__ == '__main__':
    if len(sys.argv) < 2:
        puts('Usage: %s infile.xpi [outfile.xpi]' % sys.argv[0])
    else:
        XPI_IN = os.path.realpath(sys.argv[1])
        if len(sys.argv) < 3:
            XPI_OUT = XPI_IN
        else:
            XPI_OUT = sys.argv[2]

        run(XPI_IN, XPI_OUT)
