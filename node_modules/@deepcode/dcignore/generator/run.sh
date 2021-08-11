SCRIPT_DIR=`dirname "$0"`
SOURCE_DIR="./source"
EMPTY_OUTPUT="../empty.dcignore"
FULL_OUTPUT="../full.dcignore"
REGEX="(^#.*)|((^|\/)\..*$)|(^.*\.[^\/]*$)|(.*src.*)|(^\/\*$)"

cd "$SCRIPT_DIR"
if [ -d $SOURCE_DIR ]; then
	echo "Updating source repository"
	(cd $SOURCE_DIR && git pull)
else
	echo "Cloning source repository"
	git clone https://github.com/github/gitignore.git $SOURCE_DIR
fi

TOP=(
	"# Write glob rules for ignored files."
	"# Check syntax on https://deepcode.freshdesk.com/support/solutions/articles/60000531055-how-can-i-ignore-files-or-directories-"
	"# Check examples on https://github.com/github/gitignore"
)
for ELEMENT in "${TOP[@]}"; do
	echo -e "$ELEMENT"
done > "$EMPTY_OUTPUT"
for ELEMENT in "${TOP[@]}"; do
	echo -e "$ELEMENT"
done > "$FULL_OUTPUT"

echo -e "\n# Hidden directories\n.*/" >> "$FULL_OUTPUT"

while read -r file; do
	file_name=`basename $file`
	declare -a rules=()
	while read -r line; do
		if ! [[ -z "${line// }" ]] && ! [[ "$line" =~ $REGEX ]]; then
			# The line is not empty, nor a comment, nor a rule matching:
			# a "/.dir_name/" directory, as we already have a catch-all rule above
			# a "/file_name.ext" file, as we already have extension-based filtering
			rules+=("$line")
		fi
	done <<< `cat "$file"`

	# Debug log for checking number of rules per file.
	# echo "${file_name%.*} RULES: ${#rules[@]}"

	if [ ${#rules[@]} -gt 0 ] ; then
		echo -e "\n# ${file_name%.*}" >> $FULL_OUTPUT
		for r in "${rules[@]}" ; do
		   echo "$r" >> $FULL_OUTPUT
		done
	fi
done <<< `find $SOURCE_DIR -name '*.gitignore'`

cd ..
echo "Parsing completed. Check '`pwd`/`basename $FULL_OUTPUT`' file for results."
exit 0
