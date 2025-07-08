const apiMap = {
  // Sales
  crmAssign: ['crmAssignCount', 'crmAssignCard'],
  ownersApproval: ['ownersApprovalCount', 'ownersApprovalCard'],
  dispatchConfirm: ['dispatchConfirmCount', 'dispatchConfirmCard'],

  // Priyam Dixit
  priyamLevel1: ['priyamLevel1Count', 'priyamLevel1Card'],
  priyamLevel2: ['priyamLevel2Count', 'priyamLevel2Card'],
  priyamLevel3: ['priyamLevel3Count', 'priyamLevel3Card'],
  priyamLevel4: ['priyamLevel4Count', 'priyamLevel4Card'],
  priyamLevel5: ['priyamLevel5Count', 'priyamLevel5Card'],
  priyamLevel6: ['priyamLevel6Count', 'priyamLevel6Card'],
  priyamLevel7: ['priyamLevel7Count', 'priyamLevel7Card'],

  // Kalpana CRM
  kalpanaLevel1: ['kalpanaLevel1Count', 'kalpanaLevel1Card'],
  kalpanaLevel2: ['kalpanaLevel2Count', 'kalpanaLevel2Card'],
  kalpanaLevel3: ['kalpanaLevel3Count', 'kalpanaLevel3Card'],
  kalpanaLevel4: ['kalpanaLevel4Count', 'kalpanaLevel4Card'],
  kalpanaLevel5: ['kalpanaLevel5Count', 'kalpanaLevel5Card'],
  kalpanaLevel6: ['kalpanaLevel6Count', 'kalpanaLevel6Card'],
  kalpanaLevel7: ['kalpanaLevel7Count', 'kalpanaLevel7Card'],  

  // Akansha Jain CRM
  akanshaLevel1: ['akanshaLevel1Count', 'akanshaLevel1Card'],
  akanshaLevel2: ['akanshaLevel2Count', 'akanshaLevel2Card'],
  akanshaLevel3: ['akanshaLevel3Count', 'akanshaLevel3Card'],
  akanshaLevel4: ['akanshaLevel4Count', 'akanshaLevel4Card'],
  akanshaLevel5: ['akanshaLevel5Count', 'akanshaLevel5Card'],
  akanshaLevel6: ['akanshaLevel6Count', 'akanshaLevel6Card'],
  akanshaLevel7: ['akanshaLevel7Count', 'akanshaLevel7Card'],  

  // Mahima Agarwal CRM
  mahimaLevel1: ['mahimaLevel1Count', 'mahimaLevel1Card'],
  mahimaLevel2: ['mahimaLevel2Count', 'mahimaLevel2Card'],
  mahimaLevel3: ['mahimaLevel3Count', 'mahimaLevel3Card'],
  mahimaLevel4: ['mahimaLevel4Count', 'mahimaLevel4Card'],
  mahimaLevel5: ['mahimaLevel5Count', 'mahimaLevel5Card'],
  mahimaLevel6: ['mahimaLevel6Count', 'mahimaLevel6Card'],
  mahimaLevel7: ['mahimaLevel7Count', 'mahimaLevel7Card'],  

  // Purchase Orders
  purchaseVerify: ['purchaseVerifyCount', 'purchaseVerifyCard'],
  poSupplier: ['poSupplierCount', 'poSupplierCard'],
  getDispatchDate: ['getDispatchDateCount', 'getDispatchDateCard'],
  dispatchFollowUp: ['dispatchFollowUpCount', 'dispatchFollowUpCard'],
  dispatchFollowUpADayBefore: ['dispatchFollowUpADayBeforeCount', 'dispatchFollowUpADayBeforeCard'],  
  getDispatchDetails: ['getDispatchDetailsCount', 'getDispatchDetailsCard'],
  manageHoldPODetails: ['manageHoldPOCount', 'manageHoldPOCard'],
  acPortals: ['acPortalCount', 'acPortal'],  
  receivedAtGodowns: ['receivedAtGodownCount', 'receivedAtGodown']
  
};

const apiEndpoints = {
  crmAssign: 'https://script.google.com/macros/s/AKfycbwWKHlGOSpQ5Jcof9bqCDQp-Tnl8J4lCZZT7DnGIEg75DjXYjVrvRbbjefyjdKDDPpi/exec',
  ownersApproval: 'https://script.google.com/macros/s/AKfycbzg5k4acAaEEmWfIklLzd52NW4xPb1yK4JTp_7m3GegNkDE1fPnqXCYwrVwnA6UzoLg4g/exec',
  dispatchConfirm: 'https://script.google.com/macros/s/AKfycbzuX9IvIK3aEoXA3TfzBvcAWcav_QhnuenbaYahJdeFL52Mu3KwkMpvIsVJZ7ni23M9Gg/exec',

  // Priyam Dixit
  priyamLevel1: 'https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec?crm=Priyam%20Dixit',
  priyamLevel2: 'https://script.google.com/macros/s/AKfycbyA-Q0NczExlSQmU9ZSNqFsUzVU5u3mK1gQewekQA2L7VOL7rJzTiI-Vmhqc3fiu9bb/exec?crm=Priyam%20Dixit',
  priyamLevel3: 'https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec?crm=Priyam%20Dixit',
  priyamLevel4: 'https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec?crm=Priyam%20Dixit',
  priyamLevel5: 'https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec?crm=Priyam%20Dixit',
  priyamLevel6: 'https://script.google.com/macros/s/AKfycbyo5HTKVwD2L5ORxrYKRzdJYK3trFJ5FOHkmPC00TsKQQ3iLJ6aXkboKQgzZJpuf6jNqQ/exec?crm=Priyam%20Dixit',
  priyamLevel7: 'https://script.google.com/macros/s/AKfycbx8Ourjem3diO9CTDl_wdGuJXSksFUImwIvq2gB1tFjeOUdNkLDdUso8he0-6CTlSJc/exec?crm=Priyam%20Dixit',  
    

  // Kalpana CRM
  kalpanaLevel1: 'https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec?crm=Km%20Kalpana',
  kalpanaLevel2: 'https://script.google.com/macros/s/AKfycbyA-Q0NczExlSQmU9ZSNqFsUzVU5u3mK1gQewekQA2L7VOL7rJzTiI-Vmhqc3fiu9bb/exec?crm=Km%20Kalpana',
  kalpanaLevel3: 'https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec?crm=Km%20Kalpana',
  kalpanaLevel4: 'https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec?crm=Km%20Kalpana',
  kalpanaLevel5: 'https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec?crm=Km%20Kalpana',
  kalpanaLevel6: 'https://script.google.com/macros/s/AKfycbyo5HTKVwD2L5ORxrYKRzdJYK3trFJ5FOHkmPC00TsKQQ3iLJ6aXkboKQgzZJpuf6jNqQ/exec?crm=Km%20Kalpana',
  kalpanaLevel7: 'https://script.google.com/macros/s/AKfycbx8Ourjem3diO9CTDl_wdGuJXSksFUImwIvq2gB1tFjeOUdNkLDdUso8he0-6CTlSJc/exec?crm=Km%20Kalpana',    

  // Akansha Jain CRM
  akanshaLevel1: 'https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec?crm=Akansha%20Jain',
  akanshaLevel2: 'https://script.google.com/macros/s/AKfycbyA-Q0NczExlSQmU9ZSNqFsUzVU5u3mK1gQewekQA2L7VOL7rJzTiI-Vmhqc3fiu9bb/exec?crm=Akansha%20Jain',
  akanshaLevel3: 'https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec?crm=Akansha%20Jain',
  akanshaLevel4: 'https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec?crm=Akansha%20Jain',
  akanshaLevel5: 'https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec?crm=Akansha%20Jain',
  akanshaLevel6: 'https://script.google.com/macros/s/AKfycbyo5HTKVwD2L5ORxrYKRzdJYK3trFJ5FOHkmPC00TsKQQ3iLJ6aXkboKQgzZJpuf6jNqQ/exec?crm=Akansha%20Jain',
  akanshaLevel7: 'https://script.google.com/macros/s/AKfycbx8Ourjem3diO9CTDl_wdGuJXSksFUImwIvq2gB1tFjeOUdNkLDdUso8he0-6CTlSJc/exec?crm=Akansha%20Jain',      

  // Mahima Agarwal CRM
  mahimaLevel1: 'https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec?crm=Mahima%20Agarwal',
  mahimaLevel2: 'https://script.google.com/macros/s/AKfycbyA-Q0NczExlSQmU9ZSNqFsUzVU5u3mK1gQewekQA2L7VOL7rJzTiI-Vmhqc3fiu9bb/exec?crm=Mahima%20Agarwal',
  mahimaLevel3: 'https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec?crm=Mahima%20Agarwal',
  mahimaLevel4: 'https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec?crm=Mahima%20Agarwal',
  mahimaLevel5: 'https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec?crm=Mahima%20Agarwal',
  mahimaLevel6: 'https://script.google.com/macros/s/AKfycbyo5HTKVwD2L5ORxrYKRzdJYK3trFJ5FOHkmPC00TsKQQ3iLJ6aXkboKQgzZJpuf6jNqQ/exec?crm=Mahima%20Agarwal',
  mahimaLevel7: 'https://script.google.com/macros/s/AKfycbx8Ourjem3diO9CTDl_wdGuJXSksFUImwIvq2gB1tFjeOUdNkLDdUso8he0-6CTlSJc/exec?crm=Mahima%20Agarwal',      

  // Purchase Orders
  purchaseVerify: 'https://script.google.com/macros/s/AKfycbw2hdmC5ZgntoOVLSSqwwandWQpMEm5EteFACbpQ8-EYyvhytnbJPH2MX-snSTVuNnQyA/exec',
  poSupplier: 'https://script.google.com/macros/s/AKfycbzwhv2y4qc_mNMa9TUAezVA1EUvHReTkYTCcDj8zVYT1zyb3MSaouMYhvDV3ZcyVr0T/exec',
  getDispatchDate: 'https://script.google.com/macros/s/AKfycbwyskduPHfiIO3d8tuLY4dA0pbRKQeK1ZUvkUXPJFYs5NEPo8eJBCt_dT2UzuJaBub1/exec',
  dispatchFollowUp: 'https://script.google.com/macros/s/AKfycbwO1_MihNIerxTsnJQzuEnV2hf4UdaOzAwfDjtEXgQuxrJ499jCd3PB8_9j3kMeTdhX/exec',
  dispatchFollowUpADayBefore: 'https://script.google.com/macros/s/AKfycbynKuCKar5-CgsMfOBwCZm0swnfqxsWvKylbrj8QwLDoHlTNMSoCf1YowAVPAm1EHrOWQ/exec',  
  getDispatchDetails: 'https://script.google.com/macros/s/AKfycbwKB6wQPmrOXmMQ8bM43AMyWgtDobQJ96dPJXntgZpmyJRYogSz9qQHEqIn-OwBY67Qkw/exec',
  manageHoldPODetails: 'https://script.google.com/macros/s/AKfycbxmknmN_A0jdyu8B489qcb1UfVSwyG7sGvRs3LPCj6647GyYU2oL0sIf7GaKuLodYfFeg/exec',
  acPortals: 'https://script.google.com/macros/s/AKfycbwYVf_pKrNX6WWyYF6lBSwsQwB7AIZcgAjoXU1PBR4vmTeb48huKWtagXHJXiDcjeSibw/exec',
  receivedAtGodowns: 'https://script.google.com/macros/s/AKfycbx8G0LTKVI158PxrnxuHZsrWduM6tIverj2O-8cnp_hW_P_zXJ2nfr0uH6L882TyeSM/exec' 
};

async function fetchAndUpdateCount(url, countId, cardId) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    let count = 0;

    if (data && Array.isArray(data.data)) {
      count = data.data.length;
    } else if (data && typeof data.count !== 'undefined' && data.count !== null) {
      const parsedCount = parseInt(data.count, 10);
      if (!isNaN(parsedCount)) {
        count = parsedCount;
      }
    }

    const countElement = document.getElementById(countId);
    const card = document.getElementById(cardId);

    if (countElement && card) { // Ensure elements exist before manipulating
      countElement.textContent = count;
      card.classList.remove("loading");

      // Fix: Ensure card becomes visible
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.classList.remove("error-state"); 

      card.style.animation = 'none';
      card.offsetHeight; // trigger reflow
      card.style.animation = null;

      if (count > 0) {
        card.classList.add("has-pending");
        card.classList.remove("all-clear");
      } else {
        card.classList.add("all-clear");
        card.classList.remove("has-pending");
      }
    }
  } catch (err) {
    console.error(`Failed to load ${countId}:`, err);
    const countElement = document.getElementById(countId);
    const card = document.getElementById(cardId);
    if (countElement && card) {
      countElement.textContent = "Err";
      card.classList.add("error-state");
      card.classList.remove("loading");
      card.classList.remove("has-pending");
      card.classList.remove("all-clear");
    }
  }
}

function refreshAllCounts() {
  for (const key in apiMap) {
    const [countId, cardId] = apiMap[key];
    fetchAndUpdateCount(apiEndpoints[key], countId, cardId);
  }
}

// Function to toggle CRM section visibility
function toggleCrmSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) { // Ensure section exists
        section.classList.toggle('collapsed');
        const toggleIcon = section.querySelector('.toggle-icon');
        if (toggleIcon) { // Ensure toggleIcon exists
            if (section.classList.contains('collapsed')) {
                toggleIcon.textContent = '▶'; // Right arrow for collapsed
            } else {
                toggleIcon.textContent = '▼'; // Down arrow for expanded
            }
        }
    }
}

// Function to toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Function for smooth scrolling and active sidebar links
function setupSmoothScrollAndActiveLinks() {
  document.querySelectorAll('.sidebar-nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector('.sidebar-nav .active')?.classList.remove('active');
      this.classList.add('active');

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Highlight active link on scroll
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - sectionHeight / 3) { // Adjust offset as needed
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });
}


// Auto refresh every 30 sec
setInterval(refreshAllCounts, 30000);

// On page load
document.addEventListener('DOMContentLoaded', () => {
  refreshAllCounts();
  setupSmoothScrollAndActiveLinks();
  // Set initial state of CRM sections to collapsed
  document.getElementById('priyamCrmSection').classList.add('collapsed');
  document.getElementById('kalpanaCrmSection').classList.add('collapsed');
  document.getElementById('akanshaCrmSection').classList.add('collapsed');
  document.getElementById('mahimaCrmSection').classList.add('collapsed');
});
