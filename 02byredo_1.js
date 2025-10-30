let map;
let byredoPosition;
let searchMarkers = [];
let routePolyline = null;
let infowindow = null;
const WORKER_URL = "https://small-bush-73af.0728csw.workers.dev/";

window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(() => {
        const mapContainer = document.querySelector('.byredoMap');
        map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(37.5212119, 127.0220863),
            level: 3
        });

        byredoPosition = new kakao.maps.LatLng(37.520708, 127.022684);
        infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

        const markerImageSrc = './source/MarkerB.png';
        const markerImageSize = new kakao.maps.Size(48, 48);
        const markerImageOption = { offset: new kakao.maps.Point(24, 48) };
        const markerImage = new kakao.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);

        const byredoMarker = new kakao.maps.Marker({
            position: byredoPosition,
            image: markerImage,
            map: map
        });

        const overlayContent = `
            <div class="customOverlay" style="background:#EAE7E2; padding:10px; border:1px solid #aaa; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.3); position:relative; display:flex; align-items:center; gap:8px;">
                <img src="./source_01BYREDO/logoS.jpg" alt="logo" style="width:50px;height:50px; border-radius:6px; flex-shrink:0;">
                <div style="font-size:1.4rem;">
                    <div style="position:relative; height:auto;">
                        <div style='font-weight:bold; font-size:1.6rem;'>BYREDO 가로수길점</div>
                        <div style='background-color:#222; width:20rem; height:1px; margin:0.5rem auto;'></div>
                        <div style='margin-top:1rem auto;'>서울특별시 강남구 압구정로10길 21</div>
                        <div class="close-btn" style="position:absolute; top:-5px; right:-5px; width:16px; height:16px; cursor:pointer; font-weight:bold; z-index:10;">×</div>
                    </div>
                </div>
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            content: overlayContent,
            position: new kakao.maps.LatLng(byredoPosition.getLat() + 0.0005, byredoPosition.getLng()),
            yAnchor: 1
        });
        overlay.setMap(map);

        document.querySelector('.customOverlay .close-btn').addEventListener('click', () => overlay.setMap(null));
        kakao.maps.event.addListener(byredoMarker, 'click', () => overlay.setMap(map));

        const mapTypes = { traffic: kakao.maps.MapTypeId.TRAFFIC, bicycle: kakao.maps.MapTypeId.BICYCLE };
        const activeOverlays = {};
        document.querySelectorAll('.mapTypeBox button[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                if (activeOverlays[type]) {
                    map.removeOverlayMapTypeId(mapTypes[type]);
                    activeOverlays[type] = false;
                } else {
                    map.addOverlayMapTypeId(mapTypes[type]);
                    activeOverlays[type] = true;
                }
            });
        });

        const storePositions = [
            new kakao.maps.LatLng(37.5219308, 127.0215723),
            new kakao.maps.LatLng(37.5220399, 127.0210924),
            new kakao.maps.LatLng(37.5229975, 127.0209030)
        ];
        const carparkPositions = [
            new kakao.maps.LatLng(37.5223468, 127.0225082),
            new kakao.maps.LatLng(37.5220827, 127.0225208),
            new kakao.maps.LatLng(37.5221302, 127.0229611)
        ];

        function createAnimatedMarker(pos, imgSrc) {
            const markerDiv = document.createElement('div');
            markerDiv.className = 'animated-marker';
            markerDiv.innerHTML = `<img src="${imgSrc}" alt="marker">`;
            const overlay = new kakao.maps.CustomOverlay({ position: pos, content: markerDiv, yAnchor: 1 });
            overlay.setMap(map);
            return overlay;
        }

        const storeMarkers = storePositions.map(pos => createAnimatedMarker(pos, './source/store.png'));
        const carparkMarkers = carparkPositions.map(pos => createAnimatedMarker(pos, './source/parking.png'));

        let storeVisible = false;
        let carparkVisible = false;
        window.changeMarker = function(type) {
            if(type === 'store') {
                storeVisible = !storeVisible;
                storeMarkers.forEach(m => m.setMap(storeVisible ? map : null));
            } else if(type === 'carpark') {
                carparkVisible = !carparkVisible;
                carparkMarkers.forEach(m => m.setMap(carparkVisible ? map : null));
            }
        };
        storeMarkers.forEach(m => m.setMap(null));
        carparkMarkers.forEach(m => m.setMap(null));

        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        const ps = new kakao.maps.services.Places();
        document.getElementById('searchBtn').addEventListener('click', () => {
            const keyword = document.getElementById('keyword').value.trim();
            if(!keyword) { alert('검색어를 입력하세요!'); return; }
            ps.keywordSearch(keyword, placesSearchCB);
        });
    });
});

function placesSearchCB(data, status) {
    if(status !== kakao.maps.services.Status.OK) { alert('검색 결과가 없습니다.'); return; }

    searchMarkers.forEach(m => m.setMap(null));
    searchMarkers = [];

    const bounds = new kakao.maps.LatLngBounds();

    data.forEach(place => {
        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(place.y, place.x),
            map: map
        });
        kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.setContent(`<div style="padding:5px;font-size:13px;">${place.place_name}</div>`);
            infowindow.open(map, marker);
        });
        searchMarkers.push(marker);
        bounds.extend(marker.getPosition());
    });

    map.setBounds(bounds);

    const origin = `${data[0].x},${data[0].y}`;
    const destination = `${byredoPosition.getLng()},${byredoPosition.getLat()}`;

    fetch(`${WORKER_URL}?origin=${origin}&destination=${destination}`)
        .then(res => res.json())
        .then(routeData => drawRouteOnMap(routeData))
        .catch(err => console.error("길찾기 오류:", err));
}

function drawRouteOnMap(routeData){
    if(routePolyline) routePolyline.setMap(null);

    const coords = [];
    const roads = routeData.routes[0].sections[0].roads;
    roads.forEach(road => {
        const verts = road.vertexes;
        for(let i=0; i<verts.length; i+=2){
            coords.push(new kakao.maps.LatLng(verts[i+1], verts[i]));
        }
    });

    routePolyline = new kakao.maps.Polyline({
        path: coords,
        strokeWeight: 5,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
    });
    routePolyline.setMap(map);

    const bounds = new kakao.maps.LatLngBounds();
    coords.forEach(latlng => bounds.extend(latlng));
    map.setBounds(bounds);

    
    // 총 거리 및 소요 시간
    const totalDistance = routeData.routes[0].summary.distance;
    const totalDuration = routeData.routes[0].summary.duration;

    const distanceKm = (totalDistance / 1000).toFixed(1);
    const durationMin = Math.ceil(totalDuration / 60);

    // 길찾기 결과 표시
    const infoDiv = document.querySelector('.routeInfo');
    if(infoDiv){
        infoDiv.innerText = `총 거리: ${distanceKm}km · 예상 소요시간: ${durationMin}분`;
    }
}
