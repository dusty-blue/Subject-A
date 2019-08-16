# Subject-A 
Subject-A is a simple bot for discord to make poll with custom reactions of your choice
## Getting Started
### node-canvas & chart.js
Follow the  installation instructions seen here [link](https://www.npmjs.com/package/canvas)
Note: node-chartjs is at the time of writing only compatbile with chartjs@2.4.x

### Heroku
For Heroku use the buildpacks made by [sky-uk](https://github.com/sky-uk/heroku-buildpack-cairo.git)
Heroku CLI command:
 ``` heroku buildpacks:add --index 1 https://github.com/sky-uk/heroku-buildpack-cairo.git ```

## Usage
type the following
``` !poll <question> 😃 ☹ 😑```
the bot will add the emoji as reactions and after a set period will reply with the results. 
The default time for polls is 20 minutes.
If the creator of the poll reacts with ⏹ then the poll is closed.