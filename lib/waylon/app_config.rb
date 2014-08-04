class Waylon
  class AppConfig

    attr_accessor :refresh_interval
    attr_accessor :rebuild_interval

    def self.from_hash(hash)
      new.tap do |x|
        x.refresh_interval = (hash['refresh_interval'] || 60)
        x.rebuild_interval = (hash['rebuild_interval'] || 600)
      end
    end
  end
end
