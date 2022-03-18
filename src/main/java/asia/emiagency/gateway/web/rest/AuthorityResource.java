package asia.emiagency.gateway.web.rest;

import asia.emiagency.gateway.domain.Authority;
import asia.emiagency.gateway.repository.AuthorityRepository;
import asia.emiagency.gateway.security.AuthoritiesConstants;
import asia.emiagency.gateway.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link asia.emiagency.gateway.domain.Authority}.
 */
@RestController
@RequestMapping("/api")
public class AuthorityResource {

    private final Logger log = LoggerFactory.getLogger(AuthorityResource.class);

    private static final String ENTITY_NAME = "ecommerceAuthority";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AuthorityRepository authorityRepository;

    public AuthorityResource(AuthorityRepository authorityRepository) {
        this.authorityRepository = authorityRepository;
    }

    /**
     * {@code POST  /authorities} : Create a new authority.
     *
     * @param authority the authority to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new authority, or with status {@code 400 (Bad Request)} if the authority has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/authorities")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public Mono<ResponseEntity<Authority>> createAuthority(@Valid @RequestBody Authority authority) throws URISyntaxException {
        log.debug("REST request to save Authority : {}", authority);
        if (authority.getName() != null) {
            throw new BadRequestAlertException("A new authority cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return authorityRepository
            .save(authority)
            .map(result -> {
                try {
                    return ResponseEntity
                        .created(new URI("/api/authorities/" + result.getName()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getName().toString()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /authorities/:id} : Updates an existing authority.
     *
     * @param id the id of the authority to save.
     * @param authority the authority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated authority,
     * or with status {@code 400 (Bad Request)} if the authority is not valid,
     * or with status {@code 500 (Internal Server Error)} if the authority couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/authorities/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public Mono<ResponseEntity<Authority>> updateAuthority(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody Authority authority
    ) throws URISyntaxException {
        log.debug("REST request to update Authority : {}, {}", id, authority);
        if (authority.getName() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, authority.getName())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return authorityRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return authorityRepository
                    .save(authority)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity
                            .ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getName().toString()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /authorities/:id} : Partial updates given fields of an existing authority, field will ignore if it is null
     *
     * @param id the id of the authority to save.
     * @param authority the authority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated authority,
     * or with status {@code 400 (Bad Request)} if the authority is not valid,
     * or with status {@code 404 (Not Found)} if the authority is not found,
     * or with status {@code 500 (Internal Server Error)} if the authority couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/authorities/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public Mono<ResponseEntity<Authority>> partialUpdateAuthority(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody Authority authority
    ) throws URISyntaxException {
        log.debug("REST request to partial update Authority partially : {}, {}", id, authority);
        if (authority.getName() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, authority.getName())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return authorityRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<Authority> result = authorityRepository
                    .findById(authority.getName())
                    .map(existingAuthority -> {
                        if (authority.getName() != null) {
                            existingAuthority.setName(authority.getName());
                        }

                        return existingAuthority;
                    })
                    .flatMap(authorityRepository::save);

                return result
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(res ->
                        ResponseEntity
                            .ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, res.getName().toString()))
                            .body(res)
                    );
            });
    }

    /**
     * {@code GET  /authorities} : get all the authorities.
     *
     * @param pageable the pagination information.
     * @param request a {@link ServerHttpRequest} request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of authorities in body.
     */
    @GetMapping("/authorities")
    public Mono<ResponseEntity<List<String>>> getAllCategories(
        @org.springdoc.api.annotations.ParameterObject Pageable pageable,
        ServerHttpRequest request
    ) {
        log.debug("REST request to get a page of Categories");
        return authorityRepository
            .count()
            .zipWith(authorityRepository.findAllBy(pageable).collectList())
            .map(countWithEntities -> {
                return ResponseEntity
                    .ok()
                    .headers(
                        PaginationUtil.generatePaginationHttpHeaders(
                            UriComponentsBuilder.fromHttpRequest(request),
                            new PageImpl<>(countWithEntities.getT2(), pageable, countWithEntities.getT1())
                        )
                    )
                    .body(countWithEntities.getT2().stream().map(Authority::getName).collect(Collectors.toList()));
            });
    }

    /**
     * {@code GET  /authorities/:id} : get the "id" authority.
     *
     * @param id the id of the authority to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the authority, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/authorities/{id}")
    public Mono<ResponseEntity<Authority>> getAuthority(@PathVariable String id) {
        log.debug("REST request to get Authority : {}", id);
        Mono<Authority> authority = authorityRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(authority);
    }

    /**
     * {@code DELETE  /authorities/:id} : delete the "id" authority.
     *
     * @param id the id of the authority to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/authorities/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public Mono<ResponseEntity<Void>> deleteAuthority(@PathVariable String id) {
        log.debug("REST request to delete Authority : {}", id);
        return authorityRepository
            .deleteById(id)
            .map(result ->
                ResponseEntity
                    .noContent()
                    .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                    .build()
            );
    }
}
