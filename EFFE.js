// 공통 헤더 & 푸터 불러오기
$(document).ready(function(){
    $('#header').load('header.html')
    $('#footer').load('footer.html')
})
// 메인페이지 main-page
function mainEffect() {
    //mainVideo
    let mainText=document.querySelectorAll("[class*='mainText0'],.mainTextMove")
    let mainChange=document.querySelectorAll('.mainChange')
    let mainEffe=document.querySelector('.mainEffe')

    if (!mainText.length || !mainChange.length || !mainEffe) return; 

        setTimeout(() => {
            mainText.forEach((el, idx) => {
                setTimeout(() => {
                    el.classList.add('onMove')
                }, idx * 800)
            })
        }, 2000)

        let mainTextLen = mainText[mainText.length - 1]
        let changeLen= mainChange[mainChange.length - 1]
        let changeLast = mainChange.length - 1
        mainTextLen.addEventListener('transitionend', () => {
            setTimeout(() => {
                mainChange.forEach((el) =>{
                    el.classList.remove('onChange', 'onChange2')
                })
                mainChange.forEach((el, idx) => {
                    if(idx!==changeLast){
                        setTimeout(() => {
                            el.classList.add('onChange')
                            setTimeout(() => {
                                el.classList.remove('onChange')
                                el.classList.add('onChange2')
                                idx++
                            }, 1600)
                        }, idx * 1600)
                    }else{
                        setTimeout(() => {
                            el.classList.add('onChange')
                        }, 4800)
                    }
                })
            }, 800)
        }, {once: true})

        changeLen.addEventListener('transitionend', () => {
            setTimeout(() => {
                mainText.forEach((el, idx) => {
                    setTimeout(() => {
                        el.classList.remove('onMove')
                    }, idx * 600)
                })
            }, 1800)
            
            setTimeout(() => {
                mainEffe.classList.add('onEffe')
            }, 4200)
        }, {once: true})

    //main rolling
    let main02=document.querySelector('.main02')
    let rollingBox=document.querySelector('.rollingBox')

    let clone=rollingBox.cloneNode(true)
    main02.appendChild(clone)
}
mainEffect()

// 에페소개페이지 effe-about-page
function aboutEffect() {
    //이미지 슬라이드
    let aboutSlides = document.querySelector('.aboutSlides');
    if (!aboutSlides) return;

    let slides = aboutSlides.querySelectorAll('.slide');
    let currentIndex = 1;
    let total = slides.length - 2
    let slideWidth = slides[0].clientWidth;

    aboutSlides.style.transition = 'none';
    aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    updateProgress();

        function updateProgress() {
        let page = currentIndex
        if (currentIndex === 0) page = total;
        if (currentIndex === slides.length - 1) page = 1

        let aboutProgress = document.querySelector('.aboutProgress');
        let pageIndex = document.querySelector('.pageIndex');
        let percent = (page / total) * 100;
        aboutProgress.style.width = `${percent}%`
        pageIndex.textContent = `0${page}`
    }

    aboutSlides.addEventListener('transitionend', () => {
        if (currentIndex === slides.length - 1) {
            aboutSlides.style.transition = 'none'
            currentIndex = 1
            aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`
        } else if (currentIndex === 0) {
            aboutSlides.style.transition = 'none'
            currentIndex = slides.length - 1
            aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`
        }
    });


    function moveToIndex(index) {
        currentIndex = index;
        aboutSlides.style.transition = 'transform 0.6s ease-in-out';
        aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
        updateProgress();
    }




    function autoSlide() {
         moveToIndex(currentIndex + 1)
    }
    let timer = setInterval(autoSlide, 3000);

    document.querySelector('.nextBtn').addEventListener('click', () => {
        clearInterval(timer);
        autoSlide();
        timer = setInterval(autoSlide, 3000);
    });

    document.querySelector('.prevBtn').addEventListener('click', () => {
        clearInterval(timer);
        moveToIndex(currentIndex - 1);
        timer = setInterval(autoSlide, 3000);
    });
}
aboutEffect();