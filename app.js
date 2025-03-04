const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const plantData = JSON.parse(fs.readFileSync("./data/plant_data.json", "utf8"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/result", (req, res) => {
  const { soilMoisture, temperature, humidity, lightIntensity, pHLevel } = req.body;
  const recommendedPlants = plantData.filter((plant) => {
    return (
      plant.soilMoisture === soilMoisture &&
      parseFloat(plant.temperature.split("-")[0]) <= temperature &&
      parseFloat(plant.temperature.split("-")[1]) >= temperature &&
      parseFloat(plant.humidity.split("-")[0]) <= humidity &&
      parseFloat(plant.humidity.split("-")[1]) >= humidity &&
      plant.lightIntensity === lightIntensity &&
      parseFloat(plant.pHLevel.split("-")[0]) <= pHLevel &&
      parseFloat(plant.pHLevel.split("-")[1]) >= pHLevel
    );
  });

  res.render("result", {
    recommendedPlants,
    userInput: { soilMoisture, temperature, humidity, lightIntensity, pHLevel }
  });
});
app.post("/generate-pdf", (req, res) => {
  const { soilMoisture, temperature, humidity, lightIntensity, pHLevel, plants } = req.body;

  const doc = new PDFDocument();
  const fileName = "Plant_Recommendation_Report.pdf";

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Plant Recommendation Report", { align: "center" });
  doc.moveDown(1);

  doc.fontSize(14).text("User Input Conditions:", { underline: true });
  doc.text(`Soil Moisture: ${soilMoisture}`);
  doc.text(`Temperature: ${temperature}°C`);
  doc.text(`Humidity: ${humidity}%`);
  doc.text(`Light Intensity: ${lightIntensity}`);
  doc.text(`Soil pH Level: ${pHLevel}`);
  doc.moveDown(1);

  doc.fontSize(14).text("Recommended Plants:", { underline: true });
  if (plants.length > 0) {
    plants.forEach((plant, index) => {
      doc.text(`${index + 1}. ${plant}`);
    });
  } else {
    doc.text("No suitable plants found.");
  }

  doc.end();
});

app.listen(3000,()=>{
  console.log("server is running in the prt 3000")
})
