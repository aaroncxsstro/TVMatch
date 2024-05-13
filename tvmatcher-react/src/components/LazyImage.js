import React from 'react';

const LazyImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [imageRef, setImageRef] = React.useState(null);

  React.useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef && !imageSrc) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (!didCancel && (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                setImageSrc(src);
                observer.unobserve(imageRef);
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: '75%',
          }
        );
        observer.observe(imageRef);
      } else {
        setImageSrc(src);
      }
    }

    return () => {
      didCancel = true;
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef]);

  return <img ref={setImageRef} src={imageSrc} alt={alt} className={className} />;
};

export default LazyImage;
