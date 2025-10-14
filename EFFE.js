// 공통 헤더 & 푸터 불러오기
$(document).ready(function(){
    $('#header').load('header.html')
    $('#footer').load('footer.html')
})
// 메인페이지 main-page
    //mainVideo
    let mainText=document.querySelectorAll("[class*='mainText0'],.mainTextMove")
    let mainChange=document.querySelectorAll('.mainChange')
    let mainEffe=document.querySelector('.mainEffe')

    window.addEventListener("DOMContentLoaded", ()=>{
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
    })

    //main rolling
    let main02=document.querySelector('.main02')
    let rollingBox=document.querySelector('.rollingBox')

    let clone=rollingBox.cloneNode(true)
    main02.appendChild(clone)