var config = {
  component: {
    locale: 'ko-KR',
    timezone: 'Europe/Berlin'
  },
  'mz-clock': {
    template: `
<style>
:host {
  color: grey;
  padding: 10px;
  vertical-align: middle;
  text-align: center;
  position:relative;
  display:flex;
  justify-content: center;
  align-items: center;
  background-color:#123;
}
.time {
  font-weight: bold;
  color: white;
  font-size: 100%;
}
.second {
  font-size:50%;
  vertical-align: top;
}
.date {
  font-size: 40%;
  color: gray;
}
.weeks {
  display:none;
}
</style>
<div part="content" class="content">
  <div part="date" class="date">
    <mz-clock-particle format="dddd," class="weekday" part="weekday"></mz-clock-particle>
    <mz-clock-particle format="LL" class="wholedate" part="wholedate"></mz-clock-particle>
  </div>
  <div part="time" class="time">
    <mz-clock-particle format="HH:mm" class="hour minute" part="hour minute"></mz-clock-particle><mz-clock-particle format="ss" part="second" class="second"></mz-clock-particle>
  </div>
</div>
`
  }
}

module.exports = config
