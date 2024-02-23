import wiki from "wikijs";

// https://upload.wikimedia.org/wikipedia/commons/0/0d/Berlin_reichstag_west_panorama_2.jpg
// https://en.wikipedia.org/w/api.php?action=query&titles=File:Berlin_reichstag_west_panorama_2.jpg&prop=imageinfo&iiprop=url%7Cextmetadata
const getImageData = (file) => fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=File:${file}&prop=imageinfo&iiprop=url%7Cextmetadata`).then((response) => response.json());
const getImageName = (url) => url.split('/').pop();

// this doe snot work :)
// wiki()
//   .prefixSearch("Reichstag building")
//   .then(({ results }) =>
//     Promise.all(
//       results.map((result) =>
//         wiki()
//           .page(result)
//           .then((page) => page.images())
//           .then((images) => images.map(getImageName))
//           .then((images) => Promise.all(images.map(getImageData)))
//       )
//     )
//   )
//   .then(console.log);
//   // .then(json => console.log(JSON.stringify(json)));
