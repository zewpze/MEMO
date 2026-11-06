// NOTE :) Visual Board Application Logic

(function() {
  'use strict';
  var STORAGE_KEY = 'note_board_user_data_v1';

  // Default initial data matching main.jpg
  var DEFAULT_BOARD = [
    {
      id: 'row-1',
      keyword: 'Keyword',
      cards: [
        { id: 'c-1-1', type: 'link', title: '@link', url: 'https://github.com' },
        { id: 'c-1-2', type: 'text', title: 'TEXT', content: '아이디어 메모 및 아티클 요약:\n- 첫 번째 마일스톤 완료하기\n- 디자인 시안 검토 및 톤앤매너 피드백 적용\n- 모달 팝업 반응형 테스트 완료' },
        { id: 'c-1-3', type: 'image', title: '미니멀 오브제 레퍼런스', imageUrl: SAMPLE_IMG_1 },
        { id: 'c-1-4', type: 'image', title: '건축 아치 레퍼런스', imageUrl: SAMPLE_IMG_2 }
      ]
    },
    {
      id: 'row-2',
      keyword: 'Keyword',
      cards: [
        { id: 'c-2-1', type: 'image', title: '비주얼 레퍼런스 1', imageUrl: SAMPLE_IMG_1 },
        { id: 'c-2-2', type: 'text', title: 'TEXT', content: '프로젝트 개발 노트:\n상하 스크롤바 커스텀 및 좌우 가로 스크롤 숨김 처리 구현.\n모달 팝업 및 데이터 자동 저장 확인.' }
      ]
    },
    {
      id: 'row-3',
      keyword: 'Keyword',
      cards: [
        { id: 'c-3-1', type: 'image', title: '비주얼 레퍼런스 2', imageUrl: SAMPLE_IMG_2 },
        { id: 'c-3-2', type: 'text', title: 'TEXT', content: '영감 수집 노트:\n자연스러운 크림 톤과 은은한 라벤더 컬러의 조화.\n손그림 느낌의 물결 테두리 필터 적용.' }
      ]
    }
  ];

  // State
  var boardData = [];
  var editMode = false;
  var currentRowIdForAdd = null;
  var currentViewingCard = null;
  var uploadedImageBase64 = '';
  var confirmCallback = null;

  // DOM Elements
  var keywordRowsContainer = document.getElementById('keywordRowsContainer');
  var addKeywordBtn = document.getElementById('addKeywordBtn');
  var toggleEditModeBtn = document.getElementById('toggleEditModeBtn');
  var resetDataBtn = document.getElementById('resetDataBtn');
  var toastNotification = document.getElementById('toastNotification');
  var toastMessage = document.getElementById('toastMessage');

  // Modals
  var typeSelectModal = document.getElementById('typeSelectModal');
  var closeTypeSelectBtn = document.getElementById('closeTypeSelectBtn');

  var cardFormModal = document.getElementById('cardFormModal');
  var closeCardFormBtn = document.getElementById('closeCardFormBtn');
  var cancelCardFormBtn = document.getElementById('cancelCardFormBtn');
  var cardEntryForm = document.getElementById('cardEntryForm');
  var formRowId = document.getElementById('formRowId');
  var formCardId = document.getElementById('formCardId');
  var formCardType = document.getElementById('formCardType');
  var cardFormTitle = document.getElementById('cardFormTitle');
  var linkFields = document.getElementById('linkFields');
  var textFields = document.getElementById('textFields');
  var imageFields = document.getElementById('imageFields');
  var linkTitleInput = document.getElementById('linkTitleInput');
  var linkUrlInput = document.getElementById('linkUrlInput');
  var textTitleInput = document.getElementById('textTitleInput');
  var textContentInput = document.getElementById('textContentInput');
  var imageFileInput = document.getElementById('imageFileInput');
  var imageUrlInput = document.getElementById('imageUrlInput');
  var imageCaptionInput = document.getElementById('imageCaptionInput');
  var imagePreviewArea = document.getElementById('imagePreviewArea');
  var imagePreviewImg = document.getElementById('imagePreviewImg');
  var removeImageBtn = document.getElementById('removeImageBtn');

  var keywordModal = document.getElementById('keywordModal');
  var closeKeywordModalBtn = document.getElementById('closeKeywordModalBtn');
  var cancelKeywordModalBtn = document.getElementById('cancelKeywordModalBtn');
  var keywordForm = document.getElementById('keywordForm');
  var keywordModalTitle = document.getElementById('keywordModalTitle');
  var keywordEditRowId = document.getElementById('keywordEditRowId');
  var keywordTitleInput = document.getElementById('keywordTitleInput');

  var imageZoomModal = document.getElementById('imageZoomModal');
  var closeImageZoomBtn = document.getElementById('closeImageZoomBtn');
  var enlargedImage = document.getElementById('enlargedImage');
  var enlargedImagePlaceholder = document.getElementById('enlargedImagePlaceholder');
  var enlargedCaption = document.getElementById('enlargedCaption');

  var textViewModal = document.getElementById('textViewModal');
  var closeTextViewBtn = document.getElementById('closeTextViewBtn');
  var textViewTitle = document.getElementById('textViewTitle');
  var textViewContent = document.getElementById('textViewContent');
  var editFromTextModalBtn = document.getElementById('editFromTextModalBtn');

  var confirmModal = document.getElementById('confirmModal');
  var confirmModalTitle = document.getElementById('confirmModalTitle');
  var confirmModalMessage = document.getElementById('confirmModalMessage');
  var cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
  var okConfirmBtn = document.getElementById('okConfirmBtn');

  // In-Page Toast Notification (Safe alternative to alert())
  var toastTimer = null;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastNotification.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toastNotification.classList.add('hidden');
    }, 2600);
  }

  // In-Page Confirm Modal (Safe alternative to confirm())
  function showCustomConfirm(title, message, onOk) {
    confirmModalTitle.textContent = title;
    confirmModalMessage.textContent = message;
    confirmCallback = onOk;
    confirmModal.classList.remove('hidden');
  }

  cancelConfirmBtn.addEventListener('click', function() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
  });

  okConfirmBtn.addEventListener('click', function() {
    confirmModal.classList.add('hidden');
    if (confirmCallback) {
      var fn = confirmCallback;
      confirmCallback = null;
      fn();
    }
  });

  // Load from LocalStorage
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        boardData = JSON.parse(raw);
      } else {
        boardData = JSON.parse(JSON.stringify(DEFAULT_BOARD));
        saveData();
      }
    } catch (e) {
      console.warn('LocalStorage access error, falling back to memory:', e);
      boardData = JSON.parse(JSON.stringify(DEFAULT_BOARD));
    }
  }

  // Save to LocalStorage
  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boardData));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Render Entire Board
  function renderBoard() {
    keywordRowsContainer.innerHTML = '';

    boardData.forEach(function(row) {
      var rowEl = document.createElement('div');
      rowEl.className = 'keyword-row';
      rowEl.dataset.rowId = row.id;

      // 1. Keyword Card
      var kwWrapper = document.createElement('div');
      kwWrapper.className = 'keyword-card-wrapper';

      var kwCard = document.createElement('div');
      kwCard.className = 'keyword-card';
      var kwText = document.createElement('span');
      kwText.className = 'keyword-text';
      kwText.textContent = row.keyword || 'Keyword';
      kwCard.appendChild(kwText);

      // Edit/Delete badges for Keyword
      var kwActions = document.createElement('div');
      kwActions.className = 'item-actions';

      var editKwBtn = document.createElement('button');
      editKwBtn.className = 'action-icon-btn';
      editKwBtn.title = '키워드 수정';
      editKwBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
      editKwBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openEditKeywordModal(row.id);
      });

      var delKwBtn = document.createElement('button');
      delKwBtn.className = 'action-icon-btn delete-btn';
      delKwBtn.title = '키워드 및 행 삭제';
      delKwBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
      delKwBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteKeywordRow(row.id);
      });

      kwActions.appendChild(editKwBtn);
      kwActions.appendChild(delKwBtn);
      kwWrapper.appendChild(kwCard);
      kwWrapper.appendChild(kwActions);
      rowEl.appendChild(kwWrapper);

      // 2. Horizontal Cards Track (Requirement 6: hidden scrollbar)
      var scrollTrack = document.createElement('div');
      scrollTrack.className = 'cards-scroll-track';

      // Mousewheel horizontal scrolling helper
      scrollTrack.addEventListener('wheel', function(e) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          scrollTrack.scrollLeft += e.deltaY;
        }
      }, { passive: false });

      // Cards inside this row
      row.cards.forEach(function(card) {
        var cardWrapper = document.createElement('div');
        cardWrapper.className = 'content-card-wrapper';

        var cardEl = document.createElement('div');
        cardEl.className = 'content-card';
        cardEl.dataset.cardId = card.id;

        if (card.type === 'link') {
          var linkSpan = document.createElement('span');
          linkSpan.className = 'card-link-text';
          linkSpan.textContent = card.title || '@link';
          cardEl.appendChild(linkSpan);

          // Requirement: "2. 링크는 바로 연결(모달X)"
          cardEl.addEventListener('click', function(e) {
            e.preventDefault();
            if (card.url) {
              var targetUrl = card.url;
              if (!/^https?:\/\//i.test(targetUrl)) {
                targetUrl = 'https://' + targetUrl;
              }
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            }
          });
        } else if (card.type === 'text') {
          // Requirement: "3. 텍스트는 제목만 카드에 보여주고, 내용은 클릭 시 볼 수 있도록 모달로 띄우기"
          var textSpan = document.createElement('span');
          textSpan.className = 'card-text-title';
          textSpan.textContent = card.title || 'TEXT';
          cardEl.appendChild(textSpan);

          cardEl.addEventListener('click', function() {
            openTextViewModal(row.id, card);
          });
        } else if (card.type === 'image') {
          // Requirement: "1. 이미지 파일 클릭 시 이미지 확대해서 보여주기"
          if (card.imageUrl) {
            var imgTag = document.createElement('img');
            imgTag.className = 'card-image-content';
            imgTag.src = card.imageUrl;
            imgTag.alt = card.title || '이미지 레퍼런스';
            cardEl.appendChild(imgTag);
          } else {
            cardEl.classList.add('type-image-placeholder');
            var iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.setAttribute('fill', 'none');
            iconSvg.setAttribute('stroke', 'currentColor');
            iconSvg.setAttribute('stroke-width', '1.8');
            iconSvg.classList.add('card-placeholder-icon');
            iconSvg.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>';
            cardEl.appendChild(iconSvg);
          }

          cardEl.addEventListener('click', function() {
            openImageZoomModal(card);
          });
        }

        // Card action buttons (Edit & Delete)
        var cardActions = document.createElement('div');
        cardActions.className = 'item-actions';

        var editCardBtn = document.createElement('button');
        editCardBtn.className = 'action-icon-btn';
        editCardBtn.title = '카드 수정';
        editCardBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
        editCardBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          openEditCardModal(row.id, card);
        });

        var delCardBtn = document.createElement('button');
        delCardBtn.className = 'action-icon-btn delete-btn';
        delCardBtn.title = '카드 삭제';
        delCardBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        delCardBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          deleteCard(row.id, card.id);
        });

        cardActions.appendChild(editCardBtn);
        cardActions.appendChild(delCardBtn);
        cardWrapper.appendChild(cardEl);
        cardWrapper.appendChild(cardActions);
        scrollTrack.appendChild(cardWrapper);
      });

      // 3. Right Add Button (+ button at the end of the row)
      var addCardBtn = document.createElement('button');
      addCardBtn.className = 'row-add-btn';
      addCardBtn.title = '카드 추가 (링크/이미지/텍스트)';
      addCardBtn.setAttribute('aria-label', '카드 추가');
      addCardBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      addCardBtn.addEventListener('click', function() {
        openTypeSelectModal(row.id);
      });
      scrollTrack.appendChild(addCardBtn);

      rowEl.appendChild(scrollTrack);
      keywordRowsContainer.appendChild(rowEl);
    });
  }

  // Action: Toggle Edit Mode
  toggleEditModeBtn.addEventListener('click', function() {
    editMode = !editMode;
    if (editMode) {
      document.body.classList.add('edit-mode-active');
      toggleEditModeBtn.classList.add('active');
      showToast('편집 모드가 활성화되었습니다.');
    } else {
      document.body.classList.remove('edit-mode-active');
      toggleEditModeBtn.classList.remove('active');
      showToast('편집 모드가 해제되었습니다.');
    }
  });

  // Action: Reset Data
  resetDataBtn.addEventListener('click', function() {
    showCustomConfirm('데이터 초기화', '기본 샘플 데이터로 복원하시겠습니까? 현재 변경사항은 초기화됩니다.', function() {
      boardData = JSON.parse(JSON.stringify(DEFAULT_BOARD));
      saveData();
      renderBoard();
      showToast('기본 데이터로 복원되었습니다.');
    });
  });

  // --- MODAL 1: Type Selection (무엇을 기록할까요?) ---
  function openTypeSelectModal(rowId) {
    currentRowIdForAdd = rowId;
    typeSelectModal.classList.remove('hidden');
  }

  function closeTypeSelectModal() {
    typeSelectModal.classList.add('hidden');
  }

  closeTypeSelectBtn.addEventListener('click', closeTypeSelectModal);
  typeSelectModal.addEventListener('click', function(e) {
    if (e.target === typeSelectModal) closeTypeSelectModal();
  });

  // Type selection items
  var typeOptionItems = document.querySelectorAll('.type-option-item');
  typeOptionItems.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var chosenType = btn.dataset.type;
      closeTypeSelectModal();
      openCardFormModal(currentRowIdForAdd, null, chosenType);
    });
  });

  // --- MODAL 2: Card Form Modal ---
  function openCardFormModal(rowId, existingCard, cardType) {
    formRowId.value = rowId;
    formCardId.value = existingCard ? existingCard.id : '';
    var type = existingCard ? existingCard.type : cardType;
    formCardType.value = type;

    // Reset fields
    linkFields.classList.add('hidden');
    textFields.classList.add('hidden');
    imageFields.classList.add('hidden');
    linkTitleInput.value = '';
    linkUrlInput.value = '';
    textTitleInput.value = '';
    textContentInput.value = '';
    imageUrlInput.value = '';
    imageCaptionInput.value = '';
    imageFileInput.value = '';
    uploadedImageBase64 = '';
    imagePreviewArea.classList.add('hidden');
    imagePreviewImg.src = '';

    if (type === 'link') {
      cardFormTitle.textContent = existingCard ? '링크 카드 수정' : '링크 등록';
      linkFields.classList.remove('hidden');
      if (existingCard) {
        linkTitleInput.value = existingCard.title || '';
        linkUrlInput.value = existingCard.url || '';
      }
    } else if (type === 'text') {
      cardFormTitle.textContent = existingCard ? '텍스트 카드 수정' : '텍스트 메모 작성';
      textFields.classList.remove('hidden');
      if (existingCard) {
        textTitleInput.value = existingCard.title || '';
        textContentInput.value = existingCard.content || '';
      }
    } else if (type === 'image') {
      cardFormTitle.textContent = existingCard ? '이미지 카드 수정' : '이미지 등록';
      imageFields.classList.remove('hidden');
      if (existingCard) {
        imageCaptionInput.value = existingCard.title || '';
        if (existingCard.imageUrl) {
          uploadedImageBase64 = existingCard.imageUrl;
          imagePreviewImg.src = existingCard.imageUrl;
          imagePreviewArea.classList.remove('hidden');
        }
      }
    }

    cardFormModal.classList.remove('hidden');
  }

  function closeCardFormModal() {
    cardFormModal.classList.add('hidden');
  }

  closeCardFormBtn.addEventListener('click', closeCardFormModal);
  cancelCardFormBtn.addEventListener('click', closeCardFormModal);
  cardFormModal.addEventListener('click', function(e) {
    if (e.target === cardFormModal) closeCardFormModal();
  });

  // Image Upload Handlers
  imageFileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        uploadedImageBase64 = evt.target.result;
        imagePreviewImg.src = uploadedImageBase64;
        imagePreviewArea.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  imageUrlInput.addEventListener('input', function() {
    var url = imageUrlInput.value.trim();
    if (url) {
      uploadedImageBase64 = url;
      imagePreviewImg.src = url;
      imagePreviewArea.classList.remove('hidden');
    }
  });

  removeImageBtn.addEventListener('click', function() {
    uploadedImageBase64 = '';
    imageFileInput.value = '';
    imageUrlInput.value = '';
    imagePreviewImg.src = '';
    imagePreviewArea.classList.add('hidden');
  });

  // Save Card Form Submit
  cardEntryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var rId = formRowId.value;
    var cId = formCardId.value;
    var type = formCardType.value;

    var row = boardData.find(function(r) { return r.id === rId; });
    if (!row) return;

    var cardData = {
      id: cId || ('c-' + Date.now()),
      type: type
    };

    if (type === 'link') {
      var title = linkTitleInput.value.trim();
      var url = linkUrlInput.value.trim();
      if (!url) {
        showToast('URL을 입력해 주세요.');
        return;
      }
      cardData.title = title || '@link';
      cardData.url = url;
    } else if (type === 'text') {
      var title = textTitleInput.value.trim();
      var content = textContentInput.value.trim();
      if (!title) {
        showToast('카드 제목을 입력해 주세요.');
        return;
      }
      cardData.title = title;
      cardData.content = content || '';
    } else if (type === 'image') {
      cardData.title = imageCaptionInput.value.trim() || '이미지 레퍼런스';
      cardData.imageUrl = uploadedImageBase64;
    }

    if (cId) {
      // Update existing
      var idx = row.cards.findIndex(function(c) { return c.id === cId; });
      if (idx !== -1) {
        row.cards[idx] = cardData;
      }
      showToast('카드가 수정되었습니다.');
    } else {
      // Add new
      row.cards.push(cardData);
      showToast('새 카드가 등록되었습니다.');
    }

    saveData();
    renderBoard();
    closeCardFormModal();
  });

  function openEditCardModal(rowId, card) {
    openCardFormModal(rowId, card, card.type);
  }

  function deleteCard(rowId, cardId) {
    showCustomConfirm('카드 삭제', '이 카드를 삭제하시겠습니까?', function() {
      var row = boardData.find(function(r) { return r.id === rowId; });
      if (row) {
        row.cards = row.cards.filter(function(c) { return c.id !== cardId; });
        saveData();
        renderBoard();
        showToast('카드가 삭제되었습니다.');
      }
    });
  }

  // --- MODAL 3: Keyword Add/Edit Modal (Requirement 2 & 4) ---
  addKeywordBtn.addEventListener('click', function() {
    openAddKeywordModal();
  });

  function openAddKeywordModal() {
    keywordEditRowId.value = '';
    keywordModalTitle.textContent = '키워드 추가';
    keywordTitleInput.value = '';
    keywordModal.classList.remove('hidden');
    keywordTitleInput.focus();
  }

  function openEditKeywordModal(rowId) {
    var row = boardData.find(function(r) { return r.id === rowId; });
    if (!row) return;
    keywordEditRowId.value = rowId;
    keywordModalTitle.textContent = '키워드 수정';
    keywordTitleInput.value = row.keyword;
    keywordModal.classList.remove('hidden');
    keywordTitleInput.focus();
  }

  function closeKeywordModal() {
    keywordModal.classList.add('hidden');
  }

  closeKeywordModalBtn.addEventListener('click', closeKeywordModal);
  cancelKeywordModalBtn.addEventListener('click', closeKeywordModal);
  keywordModal.addEventListener('click', function(e) {
    if (e.target === keywordModal) closeKeywordModal();
  });

  keywordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var title = keywordTitleInput.value.trim();
    if (!title) {
      showToast('키워드 제목을 꼭 입력해 주세요.');
      return;
    }

    var rowId = keywordEditRowId.value;
    if (rowId) {
      var row = boardData.find(function(r) { return r.id === rowId; });
      if (row) {
        row.keyword = title;
        showToast('키워드가 수정되었습니다.');
      }
    } else {
      var newRow = {
        id: 'row-' + Date.now(),
        keyword: title,
        cards: []
      };
      boardData.push(newRow);
      showToast('새 키워드가 추가되었습니다.');
    }

    saveData();
    renderBoard();
    closeKeywordModal();
  });

  function deleteKeywordRow(rowId) {
    showCustomConfirm('키워드 삭제', '이 키워드와 행에 포함된 모든 카드를 삭제하시겠습니까?', function() {
      boardData = boardData.filter(function(r) { return r.id !== rowId; });
      saveData();
      renderBoard();
      showToast('키워드 행이 삭제되었습니다.');
    });
  }

  // --- MODAL 4: Image Zoom Modal (Requirement: 이미지 확대) ---
  function openImageZoomModal(card) {
    if (card.imageUrl) {
      enlargedImage.src = card.imageUrl;
      enlargedImage.classList.remove('hidden');
      enlargedImagePlaceholder.classList.add('hidden');
    } else {
      enlargedImage.src = '';
      enlargedImage.classList.add('hidden');
      enlargedImagePlaceholder.classList.remove('hidden');
    }
    enlargedCaption.textContent = card.title || '';
    imageZoomModal.classList.remove('hidden');
  }

  function closeImageZoomModal() {
    imageZoomModal.classList.add('hidden');
  }

  closeImageZoomBtn.addEventListener('click', closeImageZoomModal);
  imageZoomModal.addEventListener('click', function(e) {
    if (e.target === imageZoomModal) closeImageZoomModal();
  });

  // --- MODAL 5: Text Memo View Modal (Requirement: 텍스트는 제목만 카드에, 내용은 모달로) ---
  function openTextViewModal(rowId, card) {
    currentViewingCard = { rowId: rowId, card: card };
    textViewTitle.textContent = card.title || 'TEXT';
    textViewContent.textContent = card.content || '(작성된 내용이 없습니다)';
    textViewModal.classList.remove('hidden');
  }

  function closeTextViewModal() {
    textViewModal.classList.add('hidden');
  }

  closeTextViewBtn.addEventListener('click', closeTextViewModal);
  textViewModal.addEventListener('click', function(e) {
    if (e.target === textViewModal) closeTextViewModal();
  });

  editFromTextModalBtn.addEventListener('click', function() {
    if (currentViewingCard) {
      closeTextViewModal();
      openEditCardModal(currentViewingCard.rowId, currentViewingCard.card);
    }
  });

  // ESC key to close any active modal
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeTypeSelectModal();
      closeCardFormModal();
      closeKeywordModal();
      closeImageZoomModal();
      closeTextViewModal();
      confirmModal.classList.add('hidden');
    }
  });

  // Initialize
  loadData();
  renderBoard();
})();
