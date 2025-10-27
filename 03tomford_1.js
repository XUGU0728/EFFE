window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(() => {
        const mapContainer = document.querySelector('.tomMap');
        const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(37.5284458, 127.0401040),
            level: 3
        });

        const tomPosition = new kakao.maps.LatLng(37.5284458, 127.0401040);

        // 마커
        const tomMarker = new kakao.maps.Marker({ position: tomPosition, map });

        // 커스텀 오버레이
        const overlayContent = `
            <div class="customOverlay" style="background:#603E3E; padding:10px; border:1px solid #aaa; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.3); position:relative; display:flex; align-items:center; gap:8px;">
                <img src="./source_02TOM_FORD/logoS.jpg" alt="logo" style="width:50px;height:50px; border-radius:6px; flex-shrink:0;">
                <div style="font-size:1.4rem;">
                    <div style="position:relative; height:auto;">
                        <div style='font-weight:bold; font-size:1.6rem; color:#F7F7F7'>TOM FORD 매장</div>
                        <div style='background-color:#F7F7F7; width:20rem; height:1px; margin:0.5rem auto;'></div>
                        <div style='margin-top:1rem auto; color:#F7F7F7'>강남구 압구정로 343 갤러리아백화점</div>
                        <div class="close-btn" style="color:#F7F7F7; position:absolute; top:-5px; right:-5px; width:16px; height:16px; cursor:pointer; font-weight:bold; z-index:10;">×</div>
                    </div>
                </div>
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            content: overlayContent,
            position: new kakao.maps.LatLng(tomPosition.getLat() + 0.0004, tomPosition.getLng()),
            yAnchor: 1
        });
        overlay.setMap(map);

        // X 버튼 클릭 시 오버레이 제거
        const closeOverlayBtn = document.querySelector('.tomMap .customOverlay .close-btn');
        closeOverlayBtn.addEventListener('click', () => overlay.setMap(null));

        // 마커 클릭 시 오버레이 다시 표시
        kakao.maps.event.addListener(tomMarker, 'click', () => overlay.setMap(map));

        // 교통/자전거 오버레이
        const mapTypes = {
            traffic : kakao.maps.MapTypeId.TRAFFIC,
            bicycle : kakao.maps.MapTypeId.BICYCLE
        };
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

        // 검색 기능
        const ps = new kakao.maps.services.Places();
        const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
        let searchMarkers = [];

        document.getElementById('searchBtn').addEventListener('click', () => {
            const keyword = document.getElementById('keyword').value.trim();
            if(!keyword) { alert('검색어를 입력하세요!'); return; }
            ps.keywordSearch(keyword, placesSearchCB);
        });

        function placesSearchCB(data, status){
            if(status === kakao.maps.services.Status.OK){
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
            } else {
                alert('검색 결과가 없습니다.');
            }
        }

        // 지도 컨트롤
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        window.currentTypeId = null;
        window.setOverlayMapTypeId = function(type){
            let overlayType;
            if(type === 'traffic') overlayType = kakao.maps.MapTypeId.TRAFFIC;
            else if(type === 'bicycle') overlayType = kakao.maps.MapTypeId.BICYCLE;

            if(window.currentTypeId) map.removeOverlayMapTypeId(window.currentTypeId);
            map.addOverlayMapTypeId(overlayType);
            window.currentTypeId = overlayType;

            overlay.setMap(map);
        }

        // 편의점 / 주차장 마커
        const markerSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png';

        const storePositions = [
            new kakao.maps.LatLng(37.5273635, 127.0405768),
            new kakao.maps.LatLng(37.5277111, 127.0398715),
            new kakao.maps.LatLng(37.5272101, 127.0407618)
        ];
        const carparkPositions = [
            new kakao.maps.LatLng(37.5272188, 127.0402271),
            new kakao.maps.LatLng(37.5281863, 127.0380787),
            new kakao.maps.LatLng(37.5272221, 127.0392215)
        ];

        function createCategoryMarker(pos, spriteY){
            const imageSize = new kakao.maps.Size(22,26);
            const imageOptions = { spriteOrigin: new kakao.maps.Point(10, spriteY), spriteSize: new kakao.maps.Size(36,98) };
            const markerImage = new kakao.maps.MarkerImage(markerSrc, imageSize, imageOptions);
            return new kakao.maps.Marker({ position: pos, image: markerImage, map: null });
        }

        const storeMarkers = storePositions.map(pos => createCategoryMarker(pos, 36));
        const carparkMarkers = carparkPositions.map(pos => createCategoryMarker(pos, 72));

        window.changeMarker = function(type){
            if(type === 'store'){
                storeMarkers.forEach(m => m.setMap(map));
                carparkMarkers.forEach(m => m.setMap(null));
            } else if(type === 'carpark'){
                carparkMarkers.forEach(m => m.setMap(map));
                storeMarkers.forEach(m => m.setMap(null));
            }
        }
    });
});