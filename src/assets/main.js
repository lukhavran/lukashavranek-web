(function(){
  // mobile menu
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if(burger){
    burger.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        links.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
      }
    });
  }

  // back to top
  var toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', function(){
      toTop.classList.toggle('show', window.pageYOffset > 700);
    }, {passive:true});
    toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  }

  // tag filter (offer page only)
  var filterWrap = document.getElementById('filterTags');
  if(filterWrap){
    var active = new Set();
    var filterBtns = filterWrap.querySelectorAll('.filter');
    var topics = document.querySelectorAll('.topic');
    function applyFilter(){
      var visible = 0;
      topics.forEach(function(t){
        var tags = t.getAttribute('data-tags').split(' ');
        var show = true;
        active.forEach(function(f){ if(tags.indexOf(f) === -1) show = false; });
        t.classList.toggle('hidden', !show);
        if(show) visible++;
      });
      document.querySelectorAll('.topic-group').forEach(function(g){
        var anyVisible = g.querySelector('.topic:not(.hidden)');
        g.classList.toggle('hidden', !anyVisible);
      });
      var nr = document.getElementById('noResults');
      if(nr) nr.style.display = visible ? 'none' : 'block';
      var count = document.getElementById('filterCount');
      if(count){
        if(active.size === 0){ count.textContent = ''; }
        else {
          var word = visible === 1 ? 'téma' : (visible >= 2 && visible <= 4 ? 'témata' : 'témat');
          count.textContent = 'Zobrazeno ' + visible + ' ' + word + ' z ' + topics.length + '.';
        }
      }
      filterBtns.forEach(function(b){
        var f = b.getAttribute('data-filter');
        if(f === '__reset') return;
        b.classList.toggle('off', active.size > 0 && !active.has(f));
        b.setAttribute('aria-pressed', active.has(f) ? 'true' : 'false');
      });
    }
    filterBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var f = btn.getAttribute('data-filter');
        if(f === '__reset'){ active.clear(); }
        else { active.has(f) ? active.delete(f) : active.add(f); }
        applyFilter();
      });
    });
  }

  // contact forms: client validation, then AJAX POST to Netlify Forms
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  document.querySelectorAll('form[data-contact-form]').forEach(function(form){
    var btn = form.querySelector('button[type="submit"]');
    var success = form.querySelector('.form-success');
    var error = form.querySelector('.form-error');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('.field').forEach(function(field){
        var input = field.querySelector('input, textarea');
        if(!input || !input.required){ field.classList.remove('error'); return; }
        var valid = input.value.trim().length > 0;
        if(valid && input.type === 'email') valid = validEmail(input.value);
        field.classList.toggle('error', !valid);
        input.setAttribute('aria-invalid', valid ? 'false' : 'true');
        if(!valid) ok = false;
      });
      if(!ok){
        var firstErr = form.querySelector('.field.error input, .field.error textarea');
        if(firstErr) firstErr.focus();
        return;
      }
      if(success) success.style.display = 'none';
      if(error) error.style.display = 'none';
      if(btn){ btn.disabled = true; btn.textContent = 'Odesílám…'; }
      fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        if(success){ success.style.display = 'block'; success.scrollIntoView({block:'center'}); }
      }).catch(function(){
        if(error){ error.style.display = 'block'; error.scrollIntoView({block:'center'}); }
      }).then(function(){
        if(btn){ btn.disabled = false; btn.textContent = 'Odeslat'; }
      });
    });
    form.querySelectorAll('input[required], textarea[required]').forEach(function(input){
      input.addEventListener('input', function(){
        var field = input.closest('.field');
        if(!field.classList.contains('error')) return;
        var valid = input.value.trim().length > 0;
        if(valid && input.type === 'email') valid = validEmail(input.value);
        if(valid){ field.classList.remove('error'); input.setAttribute('aria-invalid','false'); }
      });
    });
  });
})();
