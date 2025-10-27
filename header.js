// TOP버튼
    let btn = document.querySelector('.topBtn');
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    btn.addEventListener('click', scrollToTop);

// 네비게이션 navigation
    // 메인페이지 화이트 텍스트
        let nav = document.querySelector('nav');

        if (document.body.classList.contains('home')) {
        // 초기 글씨 색상 흰색
        nav.classList.add('onWhite');

        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight) {
            nav.classList.remove('onWhite');
            } else {
            nav.classList.add('onWhite');
            }
        });
        }

    // 시간
        function updateTime() {
            let time=document.getElementById('time')
            let today = new Date();   
            
            let year = today.getFullYear()
            let month = (today.getMonth() + 1)
            let day = today.getDate()
            let ampm = today.getHours() < 12 ? "AM" : "PM"
            let hours = today.getHours()
            let minutes = today.getMinutes()

            month = month < 10 ? '0' + month : month
            day = day < 10 ? '0' + day : day
            hours = hours < 10 ? '0' + hours : hours
            minutes = minutes < 10 ? '0' + minutes : minutes

            time.innerHTML=`${year} / ${month} / ${day}<br>${ampm} ${hours}:${minutes}`
        }
        updateTime()
        setInterval(updateTime, 1000)
    // 날씨
        const API_KEY='dd2c4ba83f58a423300cb164a3d2d0e0';
        let temp=document.getElementById('temp');
        let place=document.getElementById('place');
        let icon=document.getElementById('weatherIcon');

        let getweather=async(lat,lon)=>{
            let res=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`);
            let data=await res.json();
            temp.innerHTML = data.main.temp+ "°C";
            place.innerHTML = data.name;
            let iconImg=data.weather[0].icon;
            icon.src = `https://openweathermap.org/img/wn/${iconImg}@2x.png`;
        }
        navigator.geolocation.getCurrentPosition((position)=>{
            let lat=position.coords.latitude;
            let lon=position.coords.longitude;
            getweather(lat,lon);
        })

    //서브메뉴
        $(document).ready(function(){
            let menuMain = $('nav');
            let subWrap = $('.subWrap');
            let isHover = false;

            function showSub(){
                if(isHover) return;
                isHover = true;
                subWrap.stop(true,true).css({display:'block', height:0});
                let targetH = subWrap.find('.menuSub').outerHeight();
                subWrap.animate({height: targetH}, 500, 'swing');
            }

            function hideSub(){
                if(!isHover) return;
                isHover = false;
                subWrap.stop(true,true).animate({height:0}, 500, 'swing', function(){
                    subWrap.css({display:'none'});
                });
            }

            menuMain.add(subWrap).on('mouseenter', showSub);
            menuMain.add(subWrap).on('mouseleave', hideSub);
        });

    //현재페이지 강조
        let currentPage = window.location.pathname.split("/").pop();
        // 현재 페이지의 URL 경로(path) 가져오기
        // "/pages/about.html".split("/") → ["", "pages", "about.html"] 배열로 변환
        // 배열의 마지막 요소 "about.html"

        // 메인 메뉴 강조
        $('.menuMain a').each(function() {
            let link = $(this).attr('href').split("/").pop();
            if (currentPage === link) {
                $(this).addClass('active');
            }
        });

        // 서브 메뉴 강조
        $('.menuSub a').each(function() {
            let link = $(this).attr('href').split("/").pop();
            if (currentPage === link) {
                $(this).addClass('onHighlight');
                // 상위 브랜드 메뉴도 함께 강조
                let brand = $(this).closest('div').find('.subTitle').text().trim(); //closet ~ 위로 올라가며 조건에 맞는 가장 가까운 조상 찾기
                $('.menuMain a').filter(function() { //여러 항목 중에서 조건에 맞는 것만 걸러내기
                    return $(this).text().trim() === brand; //.menuMain a 중에서 글자 내용이 brand와 같은 것만 남겨라
                }).addClass('onHighlight');
            }
        });