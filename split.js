const KEEP_UNUSED = false;

const fs = require("fs");

const FILES = ["add-on", "shared", "standalone"];
const LOCALES = ["af", "ar", "as", "ast", "az", "be", "bg", "bn_BD", "bn_IN",
"bs", "ca", "cs", "cy", "da", "de", "dsb", "el", "en_GB", "eo", "es", "et",
"eu", "fa", "ff", "fi", "fr", "fy_NL", "ga", "gd", "gl", "gu_IN", "he", "hi_IN",
"hr", "hsb", "ht", "hu", "hy_AM", "id", "it", "ja", "kk", "km", "kn", "ko",
"ku", "lij", "lt", "lv", "mk", "ml", "mn", "ms", "my", "nb_NO", "ne_NP", "nl",
"or", "pa_IN", "pl", "pt", "pt_BR", "pt_PT", "ro", "ru", "si", "sk", "sl",
"son", "sq", "sr", "sv_SE", "ta", "te", "th", "tr", "uk", "ur", "vi", "xh",
"zh_CN", "zh_TW", "zu"];

function processFile(file, processor) {
  fs.readFileSync(file, "utf8").trim().replace(/\s*\\\n\s*/g, " ").split(/\n/).forEach(function(line) {
    var property = line.match(/^([^#]\S*)\s*=\s*(.*)/);
    processor(line, property && property.slice(1));
  });
}

function processLocale(locale) {
  var translated = {};
  processFile("l10n/" + locale + "/shared.properties", function(line, property) {
    if (property) {
      translated[property[0]] = property[1];
    }
  });

  var used = {};
  var out = {};
  FILES.forEach(function(file) {
    out[file] = [];

    processFile(file + ".properties", function(line, property) {
      if (property) {
        var existing = translated[property[0]];
        if (existing) {
          used[property[0]] = true;
          out[file].push(property[0] + "=" + (existing || property[1]));
        }
      }
      else {
        out[file].push(line);
      }
    });
  });

  if (KEEP_UNUSED) {
    out.shared.push("\n\n## LOCALIZATION NOTE:");
    Object.keys(translated).forEach(function(key) {
      if (!used[key]) {
        out.shared.push(key + "=" + translated[key]);
      }
    });
  }

  FILES.forEach(function(file) {
    fs.writeFileSync("l10n/" + locale + "/" + file + ".properties", out[file].join("\n") + "\n");
  });
}
LOCALES.forEach(processLocale);
