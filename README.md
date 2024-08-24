# Scheduling Automation App

A scheduling automation API for eliminating the back-and-forth emails to find the perfect time

## Features

* Integrate your Google calendar
* Consolidate your calendars to show time slots where you are free to be booked
* Adjust your availablity window throughout the day of the week
* Allow users to book a meeting or appointment on your calendar!

## CLI Documentation

`ssa auth`

Authenticates the user using OAuth2. Will direct the user to the Google login

`ssa list [-a]`

Lists the first 10 upcoming events on the user's primary calendar

Options: 
* `-a` or `--all` 
  * Retrieves all events from all of the user's calendars

`ssa configure [-dd] [-tb]`

Configures the user's availablity for booking

Options:
* `-dd` or `--days`
  * Which days is the user available? Pass a comma-delimited list of the days of the week
  * ex. `saa configure -dd mon,tues,wed,thurs,fri,sat,sun`
* `-tb [-tz]` or `--time-block --timezone`
  * What is the block of time the user will be available for booking? Use 24-hour format. Default timezone is UTC Greenwich Time. Use shorthand abbreviations for timezones
  * ex. `saa configure -tb 7:00 16:00 -tz EST`

`ssa available -d 08/23/2024`

Lists the available slots during the day