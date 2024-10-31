exports.generateImages = (req, res) => {
    const count = parseInt(req.query.count) || 1;
    const images = Array.from({ length: count }, () => `https://picsum.photos/300/200?random=${Math.random()}`);
    res.json({ images });
  };
  