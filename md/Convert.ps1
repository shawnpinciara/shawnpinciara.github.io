#GO INTO THE ./MD/ FOLDER BEFORE RUNNING THE SCRIPT
$path = Get-Location
$files = (Get-ChildItem $path | Where-Object {$_.Extension -eq '.md'}).FullName

#replace
ForEach($file in $files) {
    echo 'Converting '+$file
    (Get-Content $file) | ForEach-Object { $_.replace('.md', '.html').replace('[[','[').replace(']]',']') }| Set-Content -Path $file
}

#pandoc convert md to htm using the template
#
#(Get-ChildItem -Path $path | Where-Object {$_.Extension -eq '.md'}).BaseName | ForEach-Object {
#    pandoc -s --toc --template=easy-pandoc-templates/html/elegant_bootstrap_menu.html -M title:$_ $file -o ../($_ + '.html')
#}

#TODO: move all htmls to parent folder
