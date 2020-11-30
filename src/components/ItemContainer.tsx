import React from "react"
import './ItemContainer.css';

interface ItemContainerProps {
  url: string
  pageTitle: string
  description: string
}

const ItemContainer: React.FC<ItemContainerProps> = ({
  url,
  pageTitle,
  description,
}) => {
  return (
    <div className="item-container">
      <a href={url}>
        <h3>{pageTitle}</h3>
      </a>
      <p>{description}</p>
      <a href={url} className="read-more">Read More</a>
    </div>
  )
}

export default ItemContainer;
