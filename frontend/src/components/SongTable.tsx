import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Box,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export type SongData = {
  album: {
    album_type: string;
    artists: {
      external_urls: string;
      href: string;
      id: string;
      name: string;
      type: string;
      uri: string;
    }[];
    external_urls: string;
    id: string;
    images: {
      height: number;
      url: string;
      width: number;
    }[];
    name: string;
  };
  external_urls: string;
  id: string;
  name: string;
};

export interface SongTableProps {
  readonly topSongs: {
    readonly shortTerm: SongData[];
    readonly mediumTerm: SongData[];
    readonly longTerm: SongData[];
  };
}

type TopSongsKey = "shortTerm" | "mediumTerm" | "longTerm";

function Row({ term, songs }: { term: TopSongsKey; songs: SongData[] }) {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ position: "sticky" }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={3}>{term}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="songs">
                <TableHead>
                  <TableRow>
                    <TableCell>Album Image</TableCell>
                    <TableCell>Song Name</TableCell>
                    <TableCell>Album Name</TableCell>
                    <TableCell>Artist(s)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {songs.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell>
                        <img
                          src={song.album.images[0].url}
                          alt="album cover"
                          style={{ width: "50px", height: "50px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <a
                          href={song.external_urls}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {song.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={song.album.external_urls}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {song.album.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        {song.album.artists &&
                          song.album.artists.map((artist) => (
                            <a
                              key={artist.id}
                              href={artist.external_urls}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {artist.name}
                            </a>
                          ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const SongTable: React.FC<SongTableProps> = ({ topSongs }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: "50vh", width: "100vh" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Term</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(Object.keys(topSongs) as TopSongsKey[]).map((key) => (
            <Row key={key} term={key} songs={topSongs[key]} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SongTable;
