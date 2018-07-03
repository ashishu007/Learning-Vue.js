let readFile = async (file) => {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            resolve(evt.target.result);
        }
        reader.onerror = function (evt) {
            reject()
        }
    })
}

let initMap = () => {
    let map = L.map("map").setView([57.1450394, -2.1857973], 9); // init map
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    map.invalidateSize();
    return map;
}

window.onload = () => {
    Vue.component('my-line', {
        props: ["line"],
        template: `
        <tr @click="onClick(line)">
            <td>{{ line.id }}</td>
            <td>{{ line.size }}</td>
            <td>{{ line.collection_date }}</td>
            <td>{{ line.delivery_date }}</td>
        </tr>`,
        methods: {
            onClick: function (line) {
                this.$emit("selectedline", line)
            }
        }
    })
    app = new Vue({
        el: "main",
        mounted: function () {
            this.map = initMap();
        },
        data: { 
            lines: [],
            currentPolyline: null,
            marker1:null,
            marker2:null
             },
        methods: {
            readFile: async function (event) {
                console.log(`Loading file: ${event.target.files[0].name}`);
                let fileContent = await readFile(event.target.files[0]);
                console.log(`File size: ${fileContent.length}`);
                let lines = Papa.parse(fileContent, {
                    header: true,
                    dynamicTyping: true,
                    preview: 20
                });
                console.log(`Lines parsed: ${lines.data.length}`);
                this.lines = lines.data;
            },
            showOnMap: function (line) {
                this.map.panTo(new L.LatLng(line.collection_latitude, line.collection_longitude));
                var pointA = new L.LatLng(line.collection_latitude, line.collection_longitude);
                var pointB = new L.LatLng(line.delivery_latitude, line.delivery_longitude);
                var pointList = [pointA, pointB];
                if (this.currentPolyline != null || this.marker1 != null || this.marker2 != null) {
                    this.currentPolyline.remove();
                    this.currentPolyline=null;
                    this.marker1.remove();
                    this.marker2.remove();
                }
                this.currentPolyline = new L.Polyline(pointList, {
                    color: 'red',
                    weight: 3,
                    opacity: 0.5,
                    smoothFactor: 1
                });
                this.currentPolyline.addTo(this.map);
                this.marker1 = L.marker([line.collection_latitude, line.collection_longitude]);
                this.marker2 = L.marker([line.delivery_latitude, line.delivery_longitude]);
                this.marker1.bindPopup("Collect me from " + line.collection_latitude + line.collection_longitude);
                this.marker2.bindPopup("Deliver me at " + line.delivery_latitude + line.delivery_longitude)
                this.marker1.addTo(this.map);
                this.marker2.addTo(this.map);
            }
        }
    });
}
