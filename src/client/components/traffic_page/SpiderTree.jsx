import React, { Component } from "react";
import { hierarchy, tree } from "d3-hierarchy";

import * as d3 from "d3";

import styled from "styled-components";
import ReactDOM from "react-dom";
import mockdata from "./mockdata";

const Box = styled.div`
  height: 500x;
  width: 1000px;
  border: 2px solid;
`;

class SpiderTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoomTransform: null
    };
    this.zoom = d3.zoom().on("zoom", this.zoomed.bind(this));
  }
  componentDidMount() {
    d3.select(this.refs.svg).call(this.zoom);
    this.buildTree();
    this.drawTree();
  }

  componentDidUpdate() {
    d3.select(this.refs.svg)
      .select("svg")
      .remove();
    d3.select(this.refs.svg).call(this.zoom);

    this.buildTree();
    this.drawTree();
  }
  zoomed() {
    this.setState({
      zoomTransform: d3.event.transform
    });
  }
  buildTree() {
    const width = this.props.width;
    const height = this.props.height;

    let svg = d3
      .select(this.refs.svg)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  }

  drawTree() {
    const radius = 466;

    const tree = data =>
      d3
        .tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(
        d3.hierarchy(data)
      );
    const treeData = d3.hierarchy(this.props.data);
    const root = tree(treeData);

    const svg = d3.select(this.refs.svg).select("svg");
    const link = svg
      .append("g")
      .attr("id", "link_layer")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .linkRadial()
          .angle(d => d.x)
          .radius(d => d.y)
      );

    d3.select("#link_layer").attr("transform", this.state.zoomTransform);

    const node = svg
      .append("g")
      .attr("id", "node_layer")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants().reverse())
      .enter()
      .append("g")
      .attr(
        "transform",
        d => `
        rotate(${(d.x * 180) / Math.PI - 90})
        translate(${d.y},0)
      `
      );

    node
      .append("circle")
      .attr("fill", d => (d.children ? "#555" : "#999"))
      .attr("r", 10);

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", d => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr("text-anchor", d =>
        d.x < Math.PI === !d.children ? "start" : "end"
      )
      .attr("transform", d => (d.x >= Math.PI ? "rotate(180)" : null))
      .text(d => d.data.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "white");

    d3.select("#node_layer").attr("transform", this.state.zoomTransform);

    d3.select("#link_layer").style("margin", "auto");
    d3.select("#node_layer").style("margin", "auto");
  }

  render() {
    return <Box id="chart" ref="svg" />;
  }
}

export default SpiderTree;
