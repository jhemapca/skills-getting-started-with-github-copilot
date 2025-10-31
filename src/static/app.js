document.addEventListener('DOMContentLoaded', () => {
  const activitiesList = document.getElementById('activities-list');
  const activitySelect = document.getElementById('activity');
  const form = document.getElementById('signup-form');
  const message = document.getElementById('message');

  function showMessage(text, type = 'info') {
    message.className = `message ${type}`;
    message.textContent = text;
    message.classList.remove('hidden');
    setTimeout(() => message.classList.add('hidden'), 4000);
  }

  async function loadActivities() {
    activitiesList.innerHTML = '<p>Loading activities...</p>';
    try {
      const res = await fetch('/activities');
      if (!res.ok) throw new Error('Failed to load activities');
      const data = await res.json();
      renderActivities(data);
      populateSelect(data);
    } catch (err) {
      activitiesList.innerHTML = '<p class="error">Unable to load activities.</p>';
    }
  }

  function renderActivities(data) {
    activitiesList.innerHTML = '';
    Object.entries(data).forEach(([name, info]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';

      // Basic info
      const title = document.createElement('h4');
      title.textContent = name;
      card.appendChild(title);

      const desc = document.createElement('p');
      desc.textContent = info.description;
      card.appendChild(desc);

      const sched = document.createElement('p');
      sched.innerHTML = `<strong>Schedule:</strong> ${info.schedule}`;
      card.appendChild(sched);

      const cap = document.createElement('p');
      cap.innerHTML = `<strong>Capacity:</strong> ${info.participants.length}/${info.max_participants}`;
      card.appendChild(cap);

      // Participants section
      const participantsWrap = document.createElement('div');
      participantsWrap.className = 'participants';

      const participantsHeader = document.createElement('h5');
      participantsHeader.textContent = `Participants (${info.participants.length})`;
      participantsWrap.appendChild(participantsHeader);

      const ul = document.createElement('ul');
      ul.className = 'participants-list';

      if (Array.isArray(info.participants) && info.participants.length) {
        info.participants.forEach(email => {
          const li = document.createElement('li');
          li.textContent = email;
          ul.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No participants yet';
        li.className = 'muted';
        ul.appendChild(li);
      }

      participantsWrap.appendChild(ul);
      card.appendChild(participantsWrap);

      activitiesList.appendChild(card);
    });
  }

  function populateSelect(data) {
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    Object.keys(data).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      activitySelect.appendChild(opt);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailField = document.getElementById('email');
    const email = emailField.value.trim();
    const activity = activitySelect.value;
    if (!email || !activity) {
      showMessage('Please provide an email and choose an activity.', 'error');
      return;
    }

    try {
      const url = `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Signup failed');
      showMessage(data.message || 'Signed up!', 'success');
      form.reset();
      await loadActivities(); // refresh participants list and capacity
    } catch (err) {
      showMessage(err.message || 'Signup failed', 'error');
    }
  });

  // initial load
  loadActivities();
});
