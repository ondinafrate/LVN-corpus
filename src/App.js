import { useEffect, useRef, useState } from "react";

import "./App.css";
import * as d3 from "d3";
import { interpolateSpectral, interpolatePRGn } from "d3-scale-chromatic";
import Highlights from "./highlights.json";

const COLORS = {
  housing_color: "#404A3F",
  housing_color_light: "#f1dee8",
  public_health_color: "#623830",
  public_health_color_light: "#e7f3fe",
  education_color: "#691E32",
  education_color_light: "#eee4de",
  violence_color: "#254905",
  violence_color_light: "#f1dee1",
  economic_opportunity_color: "#4D0875",
  economic_opportunity_color_light: "#e8f6e8",
  inequality_color: "#2D1A40",
  inequality_color_light: "#ecdff3",
  infrastructure_color: "#224095",
  infrastructure_color_light: "#e4f3ee",
  institutions_color: "#533762",
  institutions_color_light: "#e0f2f3",
  safety_color: "#2E440F",
  safety_color_light: "#dfe9f2",
  community_life_color: "#234198",
  community_life_color_light: "#fcede4",
};

const toSnakeCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("_");

function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const svgRef = useRef(null);

  const audioRef = useRef(null);

  const svgHeight = 900;
  const svgWidth = Math.max(windowWidth, 800);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("g").remove();
    const g = svg.append("g").attr("transform", "translate(150,10)");

    const highlights = [
      // ...Object.values(Annotations.annotations),
      ...Highlights,
      // ...Highlights,
      // ...Highlights,
      // ...Highlights,
      // ...Highlights,
      // ...Highlights,
      // ...Highlights,
    ];

    console.log(highlights.length);

    let i = 0;

    const squareWidth = 30;
    const squareSpacing = 5;

    const xMax = Math.sqrt(highlights.length) + Math.sqrt(highlights.length);

    let minLength = Infinity;
    let maxLength = 0;

    let uniqueTags = new Set();
    highlights.sort((a, b) => {
      var nameA = a.tags[0].split(".")[0].toLowerCase(),
        nameB = b.tags[0].split(".")[0].toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    highlights.forEach((highlight) => {
      let length = highlight.highlight_end - highlight.highlight_start;
      minLength = Math.min(length, minLength);
      maxLength = Math.max(length, maxLength);
      if (highlight.tags) {
        highlight.tags.forEach((tag) => {
          uniqueTags.add(tag.split(".")[0]);
        });
      }
    });

    console.log(minLength, maxLength);
    console.log(highlights);

    const durationScale = d3.scaleLog([minLength, maxLength], [5, squareWidth]);

    const tagScale = d3.scalePoint(Array.from(uniqueTags).sort(), [0, 1]);
    console.log(uniqueTags);

    for (let y = 0; y < Math.sqrt(highlights.length); y++) {
      for (let x = 0; x < Math.sqrt(highlights.length); x++) {
        if (highlights[i]) {
          let rectG = g.append("g");
          rectG
            .append("rect")
            .data([highlights[i]])
            .attr("class", (d) => {
              // let mostPopularTag = "";
              // let mostPopularTagCount = 0;
              // if (d.tags) {
              //   d.tags.forEach((tag) => {
              //     if (Annotations.tags[tag] > mostPopularTagCount) {
              //       mostPopularTag = tag;
              //       mostPopularTagCount = Annotations.tags[tag];
              //       popularTags.add(tag);
              //     }
              //   });
              // }
              // return toSnakeCase(mostPopularTag);
            })
            .attr("x", x * squareWidth + x * squareSpacing)
            .attr("y", y * squareWidth + y * squareSpacing)
            .attr("width", (d) =>
              durationScale(d.highlight_end - d.highlight_start)
            )
            .attr("height", squareWidth)
            .attr("opacity", function (d) {
              return 0.7;
            })
            .attr("fill", function (d) {
              return interpolatePRGn(tagScale(d.tags[0].split(".")[0]));

              // if (d.tags) return interpolateSpectral(1 - (x + y) / xMax);
              return "grey";
            });
          rectG
            .append("rect")
            .data([highlights[i]])
            .attr("class", (d) => "highlightRect id_" + d.highlight_id)
            .attr("x", x * squareWidth + x * squareSpacing)
            .attr("y", y * squareWidth + y * squareSpacing)
            .attr("width", squareWidth)
            .attr("height", squareWidth)
            .attr("fill", "transparent")
            .on("click", (e, d) => {
              d3.selectAll(".highlightRect").attr("stroke", "transparent");
              if (
                audioRef.current.src ===
                "https://app.lvn.org/api/highlights/play/" + d.highlight_id
              ) {
                audioRef.current.src = "";
                audioRef.current.pause();
              } else {
                audioRef.current.src =
                  "https://app.lvn.org/api/highlights/play/" + d.highlight_id;
                audioRef.current.play();
                d3.select(".highlightRect.id_" + d.highlight_id)
                  .attr("stroke", "red")
                  .attr("stroke-width", 2);
              }
            });
        }
        i++;
      }
    }
  }, []);

  return (
    <div className="App">
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
      <audio id="audio" ref={audioRef}></audio>
    </div>
  );
}

export default App;
