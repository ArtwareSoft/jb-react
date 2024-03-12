SCRIPT_PATH=$(realpath "$0")
ext_dir=$(dirname "$SCRIPT_PATH")
jb_dir=$(realpath "$ext_dir/../..")

#rm $ext_dir/package/*
#rm -r $ext_dir/dist/*
#rm $ext_dir/plugins/loader/*

mkdir -p $ext_dir/plugins/loader
mkdir -p $ext_dir/package
mkdir -p $ext_dir/dist/css

node $jb_dir/hosts/node/jb-pack.js -plugins:ui-iframe-launcher
node $jb_dir/hosts/node/jb-pack.js -plugins:llm,ui-iframe-dialog

cp -v $jb_dir/plugins/loader/jb-loader.js $ext_dir/plugins/loader
cp -v $jb_dir/package/ui-iframe-launcher.js $ext_dir/package
cp -v $jb_dir/package/llm_ui-iframe-dialog.js $ext_dir/package

jsfiles=("mark" "md-icons" "material-components-web" "codemirror" "simplemde")
for file in "${jsfiles[@]}"; do
    cp -v "$jb_dir/dist/$file.js" $ext_dir/dist
done

cssfiles=("font" "material" "codemirror" "simplemde" "font-awesome")
for file in "${cssfiles[@]}"; do
    cp -v "$jb_dir/dist/css/$file.css" $ext_dir/dist/css
done


cp -v $jb_dir/dist/css/resizer.gif $ext_dir/dist/css
cp -v $jb_dir/dist/css/fontawesome-webfont.woff2 $ext_dir/dist/css

zip -r "$jb_dir/dist/llm_ext.zip" "$ext_dir"

echo