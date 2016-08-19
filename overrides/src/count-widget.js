const dc = require("../../mapdc")
import d3 from "d3"

export default function countWidget (parent, chartGroup) {
  const _chart = dc.baseMixin({})
  let _formatNumber = d3.format(",")
  let _countLabel = "rows"
  let _tot = null

  _chart.isCountChart = function () { return true } // override for count chart

  _chart.formatNumber = function (formatter) {
    if (!arguments.length) {
      return _formatNumber
    }
    _formatNumber = formatter
    return _chart
  }

  _chart.countLabel = function (_) {
    if (!arguments.length) {
      return _countLabel
    }
    _countLabel = _
    return _chart
  }

  _chart.tot = function (number) {
    if (!arguments.length) {
      return _tot
    }
    _tot = number
    return _chart
  }

  _chart.getTotalRecordsAsync = function () {
    if (_chart.tot()) {
      return Promise.resolve()
    }

    return _chart.dimension().sizeAsync().then((tot) => {
      _chart.tot(tot)
      return Promise.resolve()
    })
  }

  _chart.setDataAsync((group, callbacks) => (
    _chart.getTotalRecordsAsync()
          .then(group.valueAsync)
          .then((value) => {
            callbacks(null, value)
          })
          .catch((error) => {
            callbacks(error)
          })
  ))

  _chart._doRender = function (val) {
    const all = _formatNumber(_chart.tot())
    const selected = _formatNumber(val)

    const wrapper = _chart.root()
          .style("width", "auto")
          .style("height", "auto")
          .html("")
          .append("div")
          .attr("class", "count-widget")

    wrapper.append("span")
          .attr("class", "count-selected")
          .classed("not-filtered", selected === all)
          .text(selected === "-0" ? 0 : selected)

    wrapper.append("span")
          .classed("not-filtered", selected === all)
          .text(" of ")

    wrapper.append("span")
          .attr("class", "count-all")
          .text(all)

    wrapper.append("span")
          .attr("class", "count-label")
          .text(" " + _countLabel)

    return _chart
  }

  _chart._doRedraw = function (val) {
    return _chart._doRender(val)
  }

  return _chart.anchor(parent, chartGroup)
}