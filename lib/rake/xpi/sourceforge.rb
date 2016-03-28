module Rake
  module XPI
    class Config
      def publish
        raise "Sourceforge publishing not implemented"
        # add https://sourceforge.net/p/forge/documentation/Using%20the%20Release%20API/
      end
    end
  end
end
