# 画像を最適化するスクリプトファイル
# REQUIRE: ImageMagick
# EXAMPLE: ruby img-optimization.rb IMG_DIR DIST_DIR
IMG_DIR = ARGV[0]
DIST_DIR = ARGV[1]

module DistDir
  HyperRush = "hyper-rush"
  DiscupUR = "discup-ur"
end

# Check if the user has provided the required arguments
if IMG_DIR.nil? || DIST_DIR.nil?
  puts "Usage: ruby img-optimization.rb IMG_DIR DIST_DIR"
  exit
end

# check if the directories exist
if Dir.exist?(IMG_DIR) == false
  puts "The directory #{IMG_DIR} does not exist"
  exit
end

# check if the directories exist
if Dir.exist?(DIST_DIR) == false
  Dir.mkdir(DIST_DIR)
end

# Remove the trailing slash
img_dir = IMG_DIR.sub(/\/$/, "");
dist_dir = DIST_DIR.sub(/\/$/, "");
# Get all the img files in the directory
img_files = Dir.glob("#{IMG_DIR}/*.jpeg")

# if there are no img files in the directory
if img_files.empty?
  puts "No img files found in the directory #{IMG_DIR}"
  exit
end

# Optimize the img files
case dist_dir
when DistDir::HyperRush
  img_files.each do |img_file|
    dist_file = "#{dist_dir}/#{File.basename(img_file, ".jpeg")}.jpeg"
    puts "Optimize #{img_file} to #{dist_file}"
    system("magick '#{img_file}' -crop 3024x3024+1008+0 '#{dist_file}'")
    system("magick '#{dist_file}' -resize 512x512 '#{dist_file}'")
    system("magick '#{dist_file}' -quality 90 '#{dist_file}'")
  end
when DistDir::DiscupUR
  puts "Optimize DiscupUR images"
  img_files.each do |img_file|
    dist_file = "#{dist_dir}/#{File.basename(img_file, ".jpeg")}.jpeg"
    puts "Optimize #{img_file} to #{dist_file}"
    system("magick '#{img_file}' -crop 3024x3024+605+0 '#{dist_file}'")
    system("magick '#{dist_file}' -resize 512x512 '#{dist_file}'")
    system("magick '#{dist_file}' -quality 80 '#{dist_file}'")
  end
else
  puts "#{dist_dir} does not support image optimization"
  exit
end

