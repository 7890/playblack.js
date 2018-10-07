#!/bin/bash
#create PNG image with transparent background, bright waveform
#output suits playblack.js sticky player theme

which sndfile-waveform >/dev/null 2>&1 
if [ $? -ne 0 ]; then 
	echo "sndfile-waveform command not found. See https://github.com/erikd/sndfile-tools">&2; exit 1; fi

if [ $# -ne 2 ]; then 
	echo "need args: audio_in image_out">&2; exit 1; fi

infile="$1"
outfile="$2"

wavtmp="`mktemp`"
extension=`echo "$1"|rev|cut -d"." -f1|rev`
is_mp3=`echo "$extension"|grep -i mp3`
if [ $? -eq 0 ]; then
	
	which mpg123 >/dev/null 2>&1
	if [ $? -ne 0 ]; then 
		echo "mpg123 command not found. See https://www.mpg123.de"; exit 1; fi

	echo "converting mp3">&2
	mpg123 -w "$wavtmp" "$infile" >/dev/null 2>&1 
	infile="$wavtmp"
fi

if [ "$2" = "-" ]; then
	outfile="`mktemp`"; fi

echo "creating image for $infile">&2

sndfile-waveform \
	--logscale \
	--no-peak \
	--channel 0 \
	--rectified \
	--geometry 1200x200 \
	--foreground ffffffff \
	--background 00ffffff \
	--borderbg 00ffffff \
	--rmscolour ffeeeeee \
	"$infile" "$outfile" \
	1>&2
#	>/dev/null 2>&1
ret=$?

if [ "$ret" -eq 0 ]; then
	if [ "$2" = "-" ]; then
		cat "$outfile"; rm -f "$outfile">&2; fi
fi

rm -f "$wavtmp">&2

exit $ret

#EOF
