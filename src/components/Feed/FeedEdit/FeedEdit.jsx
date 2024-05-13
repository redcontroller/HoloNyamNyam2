import React, { useState, useRef, useEffect } from 'react';
import Header from '../../common/Header/Header';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { imgUpload } from '../../../api/image';
import { feedEditApi, feedUploadApi } from '../../../api/feed';
import { useRecoilState } from 'recoil';
import { feedState } from '../../../recoil/feedEditAtom';
import {
  UploadContainer,
  UploadImg,
  UploadImgDiv,
  UploadImgInput,
  UploadImgWrapper,
  CloseImgBtn,
} from '../ImgPrev/StyledFeedImgPrev';
import {
  StyledContainer,
  StyledFeed,
  SocialSVG,
  H3,
  TextContainer,
  ImagesWrapper,
} from './StyledFeedCreate';
import Carousel from '../../Carousels/Carousel';

export default function FeedCreate() {
  // 데이터
  // eslint-disable-next-line no-unused-vars
  const [feed, setFeed] = useRecoilState(feedState);
  const [isValid, setIsValid] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(
    feed.type === 'edit' ? feed.images : [],
  );
  const [content, setContent] = useState(feed.type === 'edit' ? feed.text : '');
  // const [imgUrl, setImgUrl] = useState(feed.type === 'edit' ? feed.images : []);
  const [imgFile, setImgFile] = useState([]);
  const token = sessionStorage.getItem('token');
  const username = sessionStorage.getItem('accountname');
  const dragItem = useRef(); // 드래그할 아이템의 인덱스
  const dragOverItem = useRef();
  const fileInputRef = useRef(null);
  const maxSize = 10 * 1024 * 1024;
  const navigate = useNavigate();

  // 액션: 피드 생성 함수
  const uploadNewFeed = async (imgFile, content, accountname) => {
    try {
      const uploadedImageUrls = [];
      for (const image of imgFile) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadResponse = await imgUpload(formData);
        let imageUrl = '';
        if (uploadResponse.data.filename) {
          imageUrl =
            'https://api.mandarin.weniv.co.kr/' + uploadResponse.data.filename;
        }
        uploadedImageUrls.push(imageUrl); // 결과를 배열에 추가
      }
      await feedUploadApi(content, uploadedImageUrls.join(', '), token);
      navigate('/myprofile', {
        state: {
          accountname: accountname,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 액션: 피드 생성 버튼의 이벤트 핸들러
  const handleCreate = () => {
    if (isValid) {
      uploadNewFeed(imgFile, content, username);
    } else {
      alert('게시글이 작성되지 않았습니다.');
    }
  };

  // 액션: 피드 수정 함수
  const uploadEditedFeed = async (uploadPreview, imgFile, content) => {
    try {
      const newUploadPreview = [...uploadPreview]; // 기존 images
      // 새로 추가할 이미지가 있다면,
      // window.console.log(imgFile);
      if (imgFile) {
        const uploadedImageUrls = [];
        const files = imgFile.filter((img) => img !== undefined);
        for (const image of files) {
          const formData = new FormData();
          formData.append('image', image);
          const uploadResponse = await imgUpload(formData);

          let imageUrl = '';
          if (uploadResponse.data.filename) {
            imageUrl =
              'https://api.mandarin.weniv.co.kr/' +
              uploadResponse.data.filename;
          }
          uploadedImageUrls.push(imageUrl.trim());
        }
        // window.console.log(uploadedImageUrls);
        const notUrlArr = newUploadPreview
          .map((e, i) => (e.trim().startsWith('https://') ? null : i))
          .filter((v) => v !== null);
        // window.console.log(notUrlArr);
        for (let idx in notUrlArr) {
          newUploadPreview[notUrlArr[idx]] = uploadedImageUrls[0];
          uploadedImageUrls.shift();
        }
        // window.console.log(newUploadPreview);
      }

      const res = await feedEditApi({
        feedId: feed.id,
        token: token,
        content: content,
        image: newUploadPreview.join(', '),
      });

      setFeed({
        type: 'edit',
        id: res.data.post.id,
        images: res.data.post.image.split(','),
        text: res.data.post.content,
      });
      navigate(-1);
    } catch (error) {
      console.error(error);
      navigate('/error');
      return false;
    }
  };

  // 액션: 피드 수정 버튼의 이벤트 핸들러
  const handleEdit = () => {
    if (isValid) {
      uploadEditedFeed(uploadPreview, imgFile, content);
    } else {
      alert('게시글이 수정되지 않았습니다.');
    }
  };

  // 계산: 텍스트 콘텐츠 또는 업로드된 이미지가 있는지 검사하는 함수
  const checkContent = () => {
    if (
      (!content || content.trim().length === 0) &&
      (!imgFile || imgFile.length === 0)
    ) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  // 액션: 콘텐츠 유효성 검사
  useEffect(() => {
    checkContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, imgFile]);

  const onChangeInput = (event) => {
    setContent(event.target.value);
    checkContent();
  };

  // 액션: 이미지를 업로드하는 버튼의 이벤트 핸들러
  const handleUploadImg = async (e) => {
    if (!e.target?.files) {
      return;
    }

    // 데이터: 업로드 파일과 관련된 데이터
    // const uploadedFileObjects = [];
    const compressedFiles = [];
    const imageUploadPromises = [];
    const fileList = Array.from(e.target.files);

    if (uploadPreview.length + fileList.length > 3) {
      alert('최대 3개의 이미지만 업로드 가능합니다.');
      return;
    }

    // 액션: 이미지 최적화 작업
    const processFile = async (file) => {
      // 파일 크기 및 형식 검사
      if (file.size > maxSize) {
        alert('파일 사이즈는 10MB 이하만 가능합니다');
        return;
      } else if (
        !/^(image\/jpeg|image\/png|image\/jpg|image\/gif)$/.test(file.type)
      ) {
        alert('파일 포맷은 */jpeg,*/png,*/jpg만 가능합니다');
        return;
      }

      // 데이터: 이미지 압축 사양
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 700,
        useWebWorker: true,
      };

      try {
        // 계산: 이미지 압축 (Blob 객체로 반환)
        const compressedFile = await imageCompression(file, options);
        // uploadedFileObjects.push(compressedFile);

        // 액션: 압축된 파일을 URL 형태로 반환하여 이미지 미리보기 추가
        const promise = imageCompression.getDataUrlFromFile(compressedFile);
        promise.then((result) => {
          setUploadPreview((prevUploadPreview) => [
            ...prevUploadPreview,
            result,
          ]);
        });

        // 계산: 압축 이미지를 base64로 변환
        const reader = new FileReader();
        imageUploadPromises.push(
          new Promise((resolve) => {
            reader.readAsDataURL(compressedFile);
            reader.onloadend = async () => {
              const base64data = reader.result; // Base64 타입의 데이터
              const imageFile = await formDataHandler(base64data); // image.jpg명의 file 객체
              compressedFiles.push(imageFile);
              resolve();
            };
          }),
        );
      } catch (error) {
        console.error(error);
      }
    };

    for (const file of fileList) {
      await processFile(file);
    }

    // 모든 이미지 업로드가 완료된 후 이미지 데이터 배열 업데이트
    await Promise.all(imageUploadPromises);
    setImgFile((prevImgFile) => [...prevImgFile, ...compressedFiles]);
  };

  // 계산: Base64 타입으로 인코딩된 이미지를 디코딩하고, 이름이 image.jpg인 파일 객체를 반환하는 함수
  const formDataHandler = async (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const encodingArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      encodingArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' }); // Binary Large Object
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    return file;
  };

  // 액션: 이미지 미리보기에서 취소 버튼을 처리하는 이벤트 핸들러 함수
  const removeImg = (index) => {
    const updatedUploadPreview = uploadPreview.filter(
      (_imageData, currentIndex) => currentIndex !== index,
    );
    const updatedImageUrls = imgFile.filter(
      (_imageUrl, currentIndex) => currentIndex !== index,
    );

    setUploadPreview(updatedUploadPreview);
    setImgFile(updatedImageUrls);
  };

  // 계산: 드래그 시작 지점 저장
  const dragStart = (position) => {
    dragItem.current = position;
  };

  // 계산: 드래그중인 대상이 위로 포개졌을 때 지점 저장
  const dragEnter = (position) => {
    dragOverItem.current = position;
  };

  // 액션: 드랍 (커서 뗐을 때) 시 배열 요소의 index 변경 작업
  const drop = () => {
    const newPreviewList = [...uploadPreview];
    const newFileList = [...imgFile]; // imgFile 리스트도 변경되야 해서 복사합니다.

    const dragItemValue = newPreviewList[dragItem.current];
    newPreviewList.splice(dragItem.current, 1);
    newPreviewList.splice(dragOverItem.current, 0, dragItemValue);

    const dragItemFile = newFileList[dragItem.current];
    newFileList.splice(dragItem.current, 1);
    newFileList.splice(dragOverItem.current, 0, dragItemFile);

    dragItem.current = null;
    dragOverItem.current = null;

    setUploadPreview(newPreviewList);
    setImgFile(newFileList); // 변경된 순서의 imgFile을 설정합니다.
  };

  return (
    <>
      <Header
        // type='followings'
        type='upload'
        handleUploadBtn={isValid}
        uploadHandler={feed.type === 'edit' ? handleEdit : handleCreate}
        edit={feed.type === 'edit' ? true : false}
      />
      <StyledContainer>
        <UploadContainer>
          <UploadImgWrapper
            htmlFor='file-input'
            title='클릭하면 선택한 이미지를 3장까지 업로드할 수 있어요.'
          >
            <UploadImgInput
              type='file'
              id='file-input'
              accept='image/jpeg,image/jpg,image/png,image/gif'
              multiple
              onChange={handleUploadImg}
              ref={fileInputRef}
            />
            <SocialSVG id='camera-btn-1' previews={uploadPreview} />
          </UploadImgWrapper>
          {uploadPreview?.map((preview, index) => (
            <UploadImgDiv key={index}>
              <CloseImgBtn
                onClick={(event) => {
                  event.preventDefault(); // 기본 동작 취소
                  removeImg(index);
                }}
                type='button'
                title='불러온 이미지 취소하기'
              />
              <UploadImg
                draggable
                onDragStart={(e) => dragStart(e, index)}
                onDragEnter={(e) => dragEnter(e, index)}
                onDragEnd={drop}
                onDragOver={(e) => e.preventDefault()}
                key={index}
                src={preview}
                alt='업로드된 이미지'
              />
            </UploadImgDiv>
          ))}
        </UploadContainer>
        <TextContainer>
          <StyledFeed
            rows='12'
            maxLength={500}
            placeholder='사진과 함께 게시글 입력을 해볼까요?&#13;&#10;(최대 500자)'
            value={content}
            onChange={onChangeInput}
          />
        </TextContainer>
        <H3>이미지 미리보기</H3>
        <ImagesWrapper>
          <Carousel previews={uploadPreview} userInfo={username} />
        </ImagesWrapper>
      </StyledContainer>
    </>
  );
}
