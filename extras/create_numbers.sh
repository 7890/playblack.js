#!/bin/bash

which text2wave || exit 1
which lame || exit 1
for number in {0..1}; do
	echo $number
	echo $number | text2wave -otype wav -o $number.wav -
	lame -h -b128 $number.wav $number.mp3
done

