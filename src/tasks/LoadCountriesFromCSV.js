import papa from "papaparse";
import mapData from "../data/regions.json";

class LoadCountriesFromCSV {
  allResults = [];
  countryScoresUrl =
    "/data/regionmodel.csv";
  mapCountries = mapData.features;
  load = (setFileRetrieved) => {
    papa.parse(this.countryScoresUrl, {
      download: true,
      header: true,
      complete: (result) => {
        setFileRetrieved(result.data);
      },
    });
  };
  processCountries = (countryScores, userData, setCountries, setResults) => {

    for (let i = 0; i < this.mapCountries.length; i++) {
      const mapCountry = this.mapCountries[i];
      const scoreCountry = countryScores.find(
        (c) => c.u_name === mapCountry.properties.u_name
      );
      if (scoreCountry != null) {
        var res = {
          country: scoreCountry.ParentRegion,
          region: scoreCountry.Region,
          uname: scoreCountry.u_name,
          price: Math.ceil((scoreCountry.costPerWeek * userData.Stay) / 7),
          popularity: this.calculateQualification(scoreCountry.popularity),
          qualifications: {
            nature: this.calculateQualification(scoreCountry.nature),
            architecture: this.calculateQualification(
              scoreCountry.architecture
            ),
            hiking: this.calculateQualification(scoreCountry.hiking),
            wintersports: this.calculateQualification(
              scoreCountry.wintersports
            ),
            beach: this.calculateQualification(scoreCountry.beach),
            culture: this.calculateQualification(scoreCountry.culture),
            culinary: this.calculateQualification(scoreCountry.culinary),
            entertainment: this.calculateQualification(
              scoreCountry.entertainment
            ),
            shopping: this.calculateQualification(scoreCountry.shopping),
          },
          travelMonths: [
            this.calculateTravelMonth(scoreCountry, countryScores, "jan"),
            this.calculateTravelMonth(scoreCountry, countryScores, "feb"),
            this.calculateTravelMonth(scoreCountry, countryScores, "mar"),
            this.calculateTravelMonth(scoreCountry, countryScores, "apr"),
            this.calculateTravelMonth(scoreCountry, countryScores, "may"),
            this.calculateTravelMonth(scoreCountry, countryScores, "jun"),
            this.calculateTravelMonth(scoreCountry, countryScores, "jul"),
            this.calculateTravelMonth(scoreCountry, countryScores, "aug"),
            this.calculateTravelMonth(scoreCountry, countryScores, "sep"),
            this.calculateTravelMonth(scoreCountry, countryScores, "oct"),
            this.calculateTravelMonth(scoreCountry, countryScores, "nov"),
            this.calculateTravelMonth(scoreCountry, countryScores, "dec"),
          ],
          scores: {
            totalScore: 0,
            presetTypeScore: 0,
            attr: {
              nature: {
                weight: userData.Attributes.Nature.weight,
                score: 0,
              },
              architecture: {
                weight: userData.Attributes.Architecture.weight,
                score: 0,
              },
              hiking: {
                weight: userData.Attributes.Hiking.weight,
                score: 0,
              },
              wintersports: {
                weight: userData.Attributes.Wintersports.weight,
                score: 0,
              },
              beach: {
                weight: userData.Attributes.Beach.weight,
                score: 0,
              },
              culture: {
                weight: userData.Attributes.Culture.weight,
                score: 0,
              },
              culinary: {
                weight: userData.Attributes.Culinary.weight,
                score: 0,
              },
              entertainment: {
                weight: userData.Attributes.Entertainment.weight,
                score: 0,
              },
              shopping: {
                weight: userData.Attributes.Shopping.weight,
                score: 0,
              },
            },
          },
        };
        mapCountry.properties.country = scoreCountry.ParentRegion;
        mapCountry.properties.name = scoreCountry.Region;
        res.scores.presetTypeScore = this.calculatePresetTypeScore(userData.PresetType, res.qualifications);
        res.scores.attr.nature.score = this.calculateAttributeScore(
          res.qualifications.nature,
          userData.Attributes.Nature.score
        );
        res.scores.attr.architecture.score = this.calculateAttributeScore(
          res.qualifications.architecture,
          userData.Attributes.Architecture.score
        );
        res.scores.attr.hiking.score = this.calculateAttributeScore(
          res.qualifications.hiking,
          userData.Attributes.Hiking.score
        );
        res.scores.attr.wintersports.score = this.calculateAttributeScore(
          res.qualifications.wintersports,
          userData.Attributes.Wintersports.score
        );
        res.scores.attr.beach.score = this.calculateAttributeScore(
          res.qualifications.beach,
          userData.Attributes.Beach.score
        );
        res.scores.attr.culture.score = this.calculateAttributeScore(
          res.qualifications.culture,
          userData.Attributes.Culture.score
        );
        res.scores.attr.culinary.score = this.calculateAttributeScore(
          res.qualifications.culinary,
          userData.Attributes.Culinary.score
        );
        res.scores.attr.entertainment.score = this.calculateAttributeScore(
          res.qualifications.entertainment,
          userData.Attributes.Entertainment.score
        );
        res.scores.attr.shopping.score = this.calculateAttributeScore(
          res.qualifications.shopping,
          userData.Attributes.Shopping.score
        );

        let totalAttrScore;
        if (userData.PresetType.length === 0) {
          totalAttrScore = this.calculateAttributeScoreAverage(res.scores.attr);
        } else {
          totalAttrScore = { score: res.scores.presetTypeScore, weight: userData.PresetType.length };
        }

        const preferenceScore = totalAttrScore.score / totalAttrScore.weight;
        const dissimilarityScore = 100 - preferenceScore;

        const popularityScore = res.popularity;
        const noveltyScore = 100 - res.popularity;

        const popularityWeight = userData.CompassPosition.x; // -1 to 1
        const diversityWeight = userData.CompassPosition.y; // -1 to 1
        // console.log(`Compass Position: x=${popularityWeight}, y=${diversityWeight}`);

        let filteredWeight = Math.max(0, (diversityWeight + 0.5) / 1.5); // -0.5 → 0, 1 → 1
        let dissimilarityWeight = Math.max(0, (-0.5 - diversityWeight) / 0.5); // -0.5 → 0, -1 → 1

        let popularityScoreWeight = Math.max(0, popularityWeight); // 0 to 1
        let noveltyScoreWeight = Math.max(0, -popularityWeight); // 0 to 1

        const totalWeight = filteredWeight + dissimilarityWeight + popularityScoreWeight + noveltyScoreWeight;

        if (totalWeight > 0) {
          filteredWeight /= totalWeight;
          dissimilarityWeight /= totalWeight;
          popularityScoreWeight /= totalWeight;
          noveltyScoreWeight /= totalWeight;
        } else {
          // fallback: if everything is zero (shouldn’t happen), default to equal
          filteredWeight = 1;
          dissimilarityWeight = 0;
          popularityScoreWeight = 0;
          noveltyScoreWeight = 0;
        }

        // console.log(`Weights: filtered=${filteredWeight}, dissimilarity=${dissimilarityWeight}, popularity=${popularityScoreWeight}, novelty=${noveltyScoreWeight}`);

        const totalScore =
          (filteredWeight * preferenceScore +
            dissimilarityWeight * dissimilarityScore +
            popularityScoreWeight * popularityScore +
            noveltyScoreWeight * noveltyScore).toFixed(2);

        // console.log(`Individual scores for ${res.country} (${res.region}): `);
        // console.log(`  - Preference Score: ${preferenceScore}`);
        // console.log(`  - Dissimilarity Score: ${dissimilarityScore}`);
        // console.log(`  - Popularity Score: ${popularityScore}`);
        // console.log(`  - Novelty Score: ${noveltyScore}`);
        // console.log(`  - Total Score: ${totalScore}`);

        res.scores.totalScore = totalScore;
        mapCountry.properties.result = res;
        this.allResults.push(res);
      }
    }
    this.mapCountries.sort(
      (a, b) =>
        b.properties.result.scores.totalScore -
        a.properties.result.scores.totalScore
    );
    setCountries(this.mapCountries);
    this.allResults.sort((a, b) => b.scores.totalScore - a.scores.totalScore);
    this.allResults = this.allResults.filter((a) => a.scores.totalScore > 0);
    setResults(this.allResults.slice(0, 10));
  };
  calculateQualification = (qualification) => {
    let numScore;
    switch (qualification) {
      case "--":
        numScore = 0;
        break;
      case "-":
        numScore = 25;
        break;
      case "o":
        numScore = 50;
        break;
      case "+":
        numScore = 75;
        break;
      case "++":
        numScore = 100;
        break;
      default:
        numScore = 50;
    }
    return numScore;
  };
  calculateTravelMonth = (scoreCountry, countryScores, month) => {
    let numScore;
    switch (scoreCountry[month]) {
      case "":
        if (scoreCountry.ParentRegion === "") {
          numScore = 0;
          break;
        }
        let parent = countryScores.find((c) => c.Region === scoreCountry.ParentRegion);
        numScore = this.calculateTravelMonth(parent, countryScores, month);
        break;
      case "--":
        numScore = 0;
        break;
      case "-":
        numScore = 25;
        break;
      case "o":
        numScore = 50;
        break;
      case "+":
        numScore = 75;
        break;
      case "++":
        numScore = 100;
        break;
      default:
        numScore = 50;
    }
    return numScore;
  };
  calculateAttributeScore = (countryScore, userScore) => {
    return 100 - Math.abs(userScore - countryScore);
  };
  calculateAttributeScoreAverage = (attributes) => {
    let totalScore = 0;
    let totalWeight = 0;
    for (const attribute in attributes) {
      totalScore += attributes[attribute].score * attributes[attribute].weight;
      totalWeight += attributes[attribute].weight;
    }
    return { score: totalScore, weight: totalWeight };
  };
  calculatePresetTypeScore = (attributeNames, qualifications) => {
    let totalScore = 0;
    for (const attributeName of attributeNames) {
      totalScore += qualifications[attributeName.toLowerCase()];
    }
    return totalScore;
  };
  calculateTravelMonthScore = (countryTravelMonths, userTravelMonths) => {
    let maxScore = 0;
    for (let i = 0; i < countryTravelMonths.length; i++) {
      if (userTravelMonths[i] === 0) continue;
      let monthScore = 100 - Math.abs(userTravelMonths[i] - countryTravelMonths[i]);
      if (monthScore > maxScore) {
        maxScore = monthScore;
      }
    }
    return maxScore;
  };
  calculatePriceScore = (countryPrice, userData) => {
    //change price per week to # days that user going to stay
    const maxBudget = this.getBudgetCeiling(userData.Budget);
    if (countryPrice <= maxBudget) {
      return 100;
    }
    // const pGroup = this.getPriceGroup(price);
    return 0;
  };

  getPriceGroup = (price) => {
    if (price <= 100) {
      return 1;
    } else if (price > 100 && price <= 300) {
      return 2;
    } else if (price > 300 && price <= 500) {
      return 3;
    } else if (price > 500 && price <= 1000) {
      return 4;
    } else if (price > 1000 && price <= 2000) {
      return 5;
    } else {
      return 6;
    }
  };
  getBudgetCeiling = (budget) => {
    let maxBudget = 0;
    switch (budget) {
      case 1:
        maxBudget = 100;
        break;
      case 2:
        maxBudget = 300;
        break;
      case 3:
        maxBudget = 500;
        break;
      case 4:
        maxBudget = 1000;
        break;
      case 5:
        maxBudget = 2000;
        break;
      case 6:
        maxBudget = Number.MAX_VALUE;
        break;
      default:
        break;
    }
    return maxBudget;
  };

  clamp = (val, min = 0, max = 1) => Math.max(min, Math.min(max, val));
}

export default LoadCountriesFromCSV;
